'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, LogIn } from 'lucide-react'

function LoginForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [activeTab, setActiveTab] = useState<'credentials' | 'github'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    // Check if already logged in — redirect to home
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          router.replace(callbackUrl)
        }
      })
      .catch(() => {})
  }, [router, callbackUrl])

  useEffect(() => {
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setFormError(t('login:wrongCredentials') as string)
          break
        case 'OAuthAccountNotLinked':
          setFormError(t('login:oauthNotLinked') as string)
          break
        default:
          setFormError(error)
      }
    }
  }, [error])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setLoading(true)
    setFormError('')

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            setFormError(t('login:wrongCredentials') as string)
            break
          case 'ADMIN_GITHUB_ONLY':
            setFormError(t('login:adminGithubOnly') as string)
            break
          default:
            setFormError(result.error)
        }
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setFormError(t('login:genericError') as string)
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
            NOMOS
          </h1>
          <p className="text-xs text-muted-foreground/50">AI Workbench</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-muted/50 p-1 mb-6">
          <button
            onClick={() => {
              setActiveTab('credentials')
              setFormError('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-normal ${
              activeTab === 'credentials'
                ? 'bg-background text-foreground shadow-sm-soft'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            {t('login:credentialsTab')}
          </button>
          <button
            onClick={() => {
              setActiveTab('github')
              setFormError('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-normal ${
              activeTab === 'github'
                ? 'bg-background text-foreground shadow-sm-soft'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            {t('login:githubTab')}
          </button>
        </div>

        {/* Error */}
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center">
            {formError}
          </div>
        )}

        {/* GitHub tab */}
        {activeTab === 'github' && (
          <Button
            onClick={handleGitHubLogin}
            className="w-full h-11 rounded-xl gap-3 text-sm font-medium bg-[#24292e] hover:bg-[#1b1f23] text-white transition-all duration-normal"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            {t('login:githubBtn')}
          </Button>
        )}

        {/* Credentials tab */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {t('login:emailLabel')}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="h-10 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {t('login:passwordLabel')}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full h-11 rounded-xl gap-2 text-sm font-medium transition-all duration-normal"
            >
              <LogIn className="w-4 h-4" />
              {loading ? t('login:loggingIn') : t('login:submitBtn')}
            </Button>
          </form>
        )}

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
