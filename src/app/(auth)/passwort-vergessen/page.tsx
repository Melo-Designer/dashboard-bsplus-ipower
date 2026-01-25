import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Passwort vergessen - Dashboard',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Passwort vergessen
          </h1>
          <p className="text-gray-500 mt-2">
            Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
