import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Passwort vergessen',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-2xl text-secondary mb-2">
            Passwort vergessen
          </h1>
          <p className="text-muted-foreground">
            Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
