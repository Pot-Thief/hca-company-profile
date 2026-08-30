import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // AVIF first, WebP second, and the original as the last resort. Every image
  // on this site is a photograph or a greyscale placeholder standing in for
  // one, which is exactly what these formats compress well.
  images: { formats: ['image/avif', 'image/webp'] },
};

export default nextConfig;
