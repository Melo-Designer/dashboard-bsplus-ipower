import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Always return success to prevent user enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      })

      // TODO: Send email with reset link
      // const resetUrl = `${process.env.NEXTAUTH_URL}/passwort-zuruecksetzen?token=${resetToken}`
      // await sendEmail({ to: email, subject: 'Passwort zurücksetzen', ... })

      console.log('Reset token for', email, ':', resetToken)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
