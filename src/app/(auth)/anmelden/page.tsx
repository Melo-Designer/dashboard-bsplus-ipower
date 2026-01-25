import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden',
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
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-2xl text-secondary mb-2">
            Dashboard Login
          </h1>
          <p className="text-muted-foreground">
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
