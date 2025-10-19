// next.config.js
// Next.js configuration for GitHub Pages deployment

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Export as static HTML/CSS/JS for GitHub Pages
  output: 'export',
  
  // Disable image optimization (not needed for static export)
  images: {
    unoptimized: true,
  },
  
  // Set base path for GitHub Pages deployment
  // In development: '' (empty string)
  // In production: '/detection-rules-explorer' (or your repo name)
  basePath: isProd ? '/detection-rules-explorer' : '',
  assetPrefix: isProd ? '/detection-rules-explorer/' : '',
}

module.exports = nextConfig