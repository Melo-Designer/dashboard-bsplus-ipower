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
  async headers() {
    return [
      {
        source: '/api/public/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value:
              process.env.NODE_ENV === 'production'
                ? 'https://bsplus-service.de,https://ipower.de'
                : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Website',
          },
        ],
      },
    ]
  },
}

export default nextConfig
