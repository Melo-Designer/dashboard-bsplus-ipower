import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, './'),
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'dashboard.bsplus-service.de',
      },
      {
        protocol: 'https',
        hostname: 'dashboard.ipower.de',
      },
      {
        protocol: 'https',
        hostname: 'bs-plus-back.melodesigner.dev',
      },
      {
        protocol: 'https',
        hostname: 'admin.ipower.de',
      },
    ],
  },
  // CORS is handled by middleware.ts for dynamic origin matching
}

export default nextConfig
