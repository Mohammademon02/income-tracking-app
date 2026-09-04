import withPWA from 'next-pwa'

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
    removeConsole: process.env.NODE_ENV === 'production',
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

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Financial data must never be served from a cache. A stale balance or a
    // stale withdrawal status is worse than an offline error, and API responses
    // are account data we don't want sitting in the browser's cache storage.
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkOnly',
    },
    // Google Fonts stylesheets change rarely; the font files never do.
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // Build output is content-hashed, so it is safe to serve from cache first.
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // Pages: always try the network so the user sees live numbers. The cached
    // copy is a short-lived offline fallback only.
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
  ],
})(nextConfig)
