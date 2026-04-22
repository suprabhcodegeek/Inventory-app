// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: '**' },
//     ],
//   },
//   experimental: {
//     serverComponentsExternalPackages: ['@prisma/client'],
//   },
// }

// module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Move it here, outside of experimental:
  serverExternalPackages: ['@prisma/client'],

  allowedDevOrigins: ['192.168.31.159:8000', 'localhost:8000'],
  
  }


module.exports = nextConfig