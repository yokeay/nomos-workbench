import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { db, users } from '@/lib/db';
import { eq, or } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/crypto';
import { TOTP, Secret } from 'otpauth';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: 'TOTP Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const totpCode = credentials.totpCode as string | undefined;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Admin accounts must use GitHub — return generic error to prevent user enumeration
        if (user.role === 'admin') {
          throw new Error('Invalid credentials');
        }

        if (user.totpEnabled && user.totpSecret) {
          if (!totpCode) {
            throw new Error('TOTP_REQUIRED');
          }

          const decryptedSecret = decrypt(user.totpSecret);
          const totp = new TOTP({
            issuer: 'NOMOS Workbench',
            label: user.email,
            secret: decryptedSecret,
          });

          const isValidTOTP = totp.validate({ token: totpCode, window: 1 });
          if (!isValidTOTP) {
            throw new Error('Invalid TOTP code');
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const githubId = account.providerAccountId;

        // Find existing user by githubId first, then by email
        let [existing] = await db
          .select()
          .from(users)
          .where(githubId ? or(eq(users.githubId, githubId), eq(users.email, user.email || '')) : eq(users.email, user.email || ''))
          .limit(1);

        const isAdmin = user.email
          ? ADMIN_EMAILS.includes(user.email.toLowerCase())
          : false;

        if (existing) {
          const updates: Record<string, any> = { githubId, updatedAt: Date.now() };
          if (isAdmin && existing.role !== 'admin') updates.role = 'admin';
          if (user.image) updates.avatar = user.image;

          await db.update(users).set(updates).where(eq(users.id, existing.id));

          user.id = existing.id;
          user.role = isAdmin ? 'admin' : existing.role;
        } else {
          // Create new user from GitHub
          const id = uuidv4();
          const now = Date.now();
          await db.insert(users).values({
            id,
            name: user.name || (user.email ? user.email.split('@')[0] : 'GitHub User'),
            email: user.email || '',
            passwordHash: '',
            githubId,
            role: isAdmin ? 'admin' : 'user',
            avatar: user.image || null,
            createdAt: now,
            updatedAt: now,
          });
          user.id = id;
          user.role = isAdmin ? 'admin' : 'user';
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export async function registerUser(
  name: string,
  email: string,
  password: string,
  githubId?: string
): Promise<string> {
  const { hash } = await import('bcryptjs');
  const hashedPassword = await hash(password, 12);

  const id = uuidv4();
  const now = Date.now();

  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

  await db.insert(users).values({
    id,
    name,
    email,
    passwordHash: hashedPassword,
    githubId: githubId || null,
    role: isAdmin ? 'admin' : 'user',
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function enableTOTP(userId: string): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  const secret = new Secret();
  const secretBase32 = secret.base32;
  const encryptedSecret = encrypt(secretBase32);

  await db
    .update(users)
    .set({
      totpSecret: encryptedSecret,
      totpEnabled: 1,
      updatedAt: Date.now(),
    })
    .where(eq(users.id, userId));

  const totp = new TOTP({
    issuer: 'NOMOS Workbench',
    label: user.email,
    secret: Secret.fromBase32(secretBase32),
  });

  return totp.toString();
}

export async function disableTOTP(userId: string, totpCode: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user || !user.totpSecret) {
    throw new Error('TOTP not enabled');
  }

  const decryptedSecret = decrypt(user.totpSecret);
  const totp = new TOTP({
    issuer: 'NOMOS Workbench',
    label: user.email,
    secret: decryptedSecret,
  });

  const isValid = totp.validate({ token: totpCode, window: 1 });
  if (!isValid) {
    throw new Error('Invalid TOTP code');
  }

  await db
    .update(users)
    .set({
      totpSecret: null,
      totpEnabled: 0,
      updatedAt: Date.now(),
    })
    .where(eq(users.id, userId));
}
