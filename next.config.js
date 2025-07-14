/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // убираем appDir - больше не нужен в Next.js 14
  },
  images: {
    unoptimized: true
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}
module.exports = nextConfig
