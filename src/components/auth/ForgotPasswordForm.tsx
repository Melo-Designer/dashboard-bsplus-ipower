'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(undefined)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        throw new Error('Fehler beim Senden')
      }

      setIsSuccess(true)
    } catch {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-success text-success-text font-bold text-center p-2.5 rounded-15">
          E-Mail gesendet
        </div>
        <p className="text-text-color">
          Falls ein Konto mit dieser E-Mail existiert, erhalten Sie in Kürze
          eine E-Mail mit weiteren Anweisungen.
        </p>
        <Link
          href="/anmelden"
          className="inline-block text-secondary underline hover:text-primary transition-colors"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    )
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
          placeholder="ihre@email.de"
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
        {isLoading ? 'Wird gesendet...' : 'Link senden'}
      </Button>

      <div className="text-center">
        <Link
          href="/anmelden"
          className="text-sm text-secondary underline hover:text-primary transition-colors"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </form>
  )
}
