'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface LoginFormProps {
  error?: string
  callbackUrl?: string
}

const isDev = process.env.NODE_ENV === 'development'

export function LoginForm({ error: initialError, callbackUrl }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickLogin = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      const result = await signIn('credentials', {
        email: 'admin@example.com',
        password: 'change-this-password',
        redirect: false,
      })

      if (result?.error) {
        setError('Quick login fehlgeschlagen')
        setIsLoading(false)
        return
      }

      router.push(callbackUrl || '/dashboard')
      router.refresh()
    } catch {
      setError('Ein Fehler ist aufgetreten')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(undefined)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Ungültige Anmeldedaten')
        setIsLoading(false)
        return
      }

      router.push(callbackUrl || '/dashboard')
      router.refresh()
    } catch {
      setError('Ein Fehler ist aufgetreten')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-primary text-white font-bold text-center p-2.5 rounded-15">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>

      <Button
        variant="secondary"
        buttonType="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
      </Button>

      {isDev && (
        <button
          type="button"
          onClick={handleQuickLogin}
          disabled={isLoading}
          className="w-full text-sm text-secondary underline hover:text-primary transition-colors"
        >
          Quick Login (Dev)
        </button>
      )}

      <div className="text-center">
        <a
          href="/passwort-vergessen"
          className="text-sm text-secondary underline hover:text-primary transition-colors"
        >
          Passwort vergessen?
        </a>
      </div>
    </form>
  )
}
