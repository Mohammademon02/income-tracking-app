/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Image optimization enabled (Next.js WebP conversion, lazy loading, resizing)
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle analyzer for production builds
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')())({
          enabled: true,
        })
      )
      return config
    },
  }),
}

export default nextConfig
