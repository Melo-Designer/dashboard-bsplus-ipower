import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { oswald, sourceSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard - BS Plus & iPower',
    template: '%s | Dashboard',
  },
  description: 'Verwaltungs-Dashboard für BS Plus und iPower Webseiten',
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${oswald.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
