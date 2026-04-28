import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/crypto';
import { TOTP, Secret } from 'otpauth';
import { v4 as uuidv4 } from 'uuid';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Verify password
        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Check TOTP if enabled
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
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

/**
 * Register a new user
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<string> {
  const { hash } = await import('bcryptjs');
  const hashedPassword = await hash(password, 12);

  const id = uuidv4();
  const now = Date.now();

  await db.insert(users).values({
    id,
    name,
    email,
    passwordHash: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Enable TOTP for a user
 * Returns the TOTP URI for QR code generation
 */
export async function enableTOTP(userId: string): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  // Generate new TOTP secret
  const secret = new Secret();
  const secretBase32 = secret.base32;
  const encryptedSecret = encrypt(secretBase32);

  // Update user with encrypted TOTP secret
  await db
    .update(users)
    .set({
      totpSecret: encryptedSecret,
      totpEnabled: 1,
      updatedAt: Date.now(),
    })
    .where(eq(users.id, userId));

  // Create a TOTP instance for URI generation
  const totp = new TOTP({
    issuer: 'NOMOS Workbench',
    label: user.email,
    secret: Secret.fromBase32(secretBase32),
  });

  return totp.toString();
}

/**
 * Verify and disable TOTP for a user
 */
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