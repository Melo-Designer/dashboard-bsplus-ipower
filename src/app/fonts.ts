import { Oswald, Source_Sans_3 } from 'next/font/google'

export const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-oswald',
  display: 'swap',
  preload: true,
})

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal'],
  variable: '--font-source-sans',
  display: 'swap',
  preload: true,
})
