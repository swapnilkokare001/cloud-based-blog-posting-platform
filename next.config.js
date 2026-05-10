/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker / AWS standalone deployment
  output: 'standalone',

  // Disable "X-Powered-By: Next.js" response header (security)
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Local dev only
      ...(process.env.NODE_ENV === 'development'
        ? [{ protocol: 'http', hostname: 'localhost' }]
        : []),
      // AWS CloudFront CDN
      { protocol: 'https', hostname: '**.cloudfront.net' },
      // AWS S3 direct
      { protocol: 'https', hostname: '**.amazonaws.com' },
      // Google user avatars (for Google OAuth)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;