'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  return {
    user: session?.user,
    isLoggedIn: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: (session?.user as any)?.role === 'admin',
  }
}
