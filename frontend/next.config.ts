/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/Uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/products/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/Uploads/*/**',
      },
    ],
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: true,  // <<< Add this line
  },
};

module.exports = nextConfig;
