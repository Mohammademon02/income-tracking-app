/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Image optimization enabled (Next.js WebP conversion, lazy loading, resizing)
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
