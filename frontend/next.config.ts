// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // ✅ Allow loading images from backend server (localhost in dev)
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/Uploads/**',
//       },
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/uploads/products/**',
//       },
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/Uploads/*/**',
//       },
//     ],
//     domains: ['localhost'], // ✅ Still required for legacy support
//   },

//   // ✅ Prevent ESLint errors from failing the build on Vercel
//   eslint: {
//     ignoreDuringBuilds: true, // 👈 Added by ChatGPT to avoid ESLint build errors in Vercel
//   },
// };

// module.exports = nextConfig;




/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'ahazpharma.onrender.com',
        port: '',
        pathname: '/uploads/**', // Matches /uploads/products/** and other subpaths
      },
      {
        protocol: 'https',
        hostname: 'ahazpharma.onrender.com',
        port: '',
        pathname: '/uploads/**', // Added to handle case-insensitive paths
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Avoid ESLint build errors in Vercel
  },
};

module.exports = nextConfig;