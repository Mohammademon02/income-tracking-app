/**
 * The service worker is NOT built from here.
 *
 * next-pwa hooked the `webpack()` config, and Next 16 builds with Turbopack,
 * so it silently stopped running — `public/sw.js` sat in the repo months out
 * of date and no service worker change took effect. The worker is now built by
 * the Serwist CLI as its own step (see serwist.config.mjs and the `build`
 * script), which is bundler-agnostic and fails loudly.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for better performance
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Compiler optimizations
  compiler: {
    // Strip console noise in production but keep errors and warnings. With
    // everything stripped, the error boundary's own logging vanished too, so a
    // production crash left no trace anywhere.
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Turbopack configuration
  turbopack: {},
}

export default nextConfig
