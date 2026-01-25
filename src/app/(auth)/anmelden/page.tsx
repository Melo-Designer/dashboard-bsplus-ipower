import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden - Dashboard',
  description: 'Melden Sie sich im Dashboard an',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const session = await auth()
  const params = await searchParams

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Login
          </h1>
          <p className="text-gray-500 mt-2">
            BS Plus & iPower Verwaltung
          </p>
        </div>

        <LoginForm
          error={params.error}
          callbackUrl={params.callbackUrl}
        />
      </div>
    </div>
  )
}
