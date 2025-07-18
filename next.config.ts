/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverActions: {
      bodySizeLimit: '15mb' // Naikkan limit jadi 15MB
    },

    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seyiyagsihmcmppyadlc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

// PERBAIKAN DI SINI: Gunakan module.exports
module.exports = nextConfig;