/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  /* PERF: Tree-shake icon libraries — only include used icons in bundle */
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react'],
  },
  // Compress responses for faster delivery
  compress: true,
  // Add security and caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
