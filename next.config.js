/** @type {import('next').NextConfig} */

/**
 * Next.js Configuration for FitBody E-commerce Platform
 * 
 * This configuration is optimized for static export to GitHub Pages
 * with data fetched from a headless WordPress API at api.fitbody.mk
 * 
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */

// API domain - centralized configuration for WordPress backend
const API_DOMAIN = process.env.API_DOMAIN || 'api.fitbody.mk';

// Base path - leave empty for custom domain or root deployment
const BASE_PATH = '';

const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Use SWC minifier for faster builds
  swcMinify: true,
  
  // Add trailing slashes to URLs for better compatibility with static hosting
  trailingSlash: true,
  
  // Static export configuration - generates static HTML/CSS/JS
  output: 'export',
  
  // Image optimization configuration
  images: {
    // Allowed image domains for next/image component
    domains: [
      'localhost',
      'api.fitbody.mk',
      'fitbody.mk',
      'staging.fitbody.mk',
      'strani.mk',
      'via.placeholder.com',
    ],
    // Disable image optimization for static export
    unoptimized: true,
    // Image formats to support
    formats: ['image/webp'],
  },

  // Environment variables exposed to the browser
  env: {
    // WordPress REST API endpoints
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL || `https://${API_DOMAIN}/wp-json/wp/v2`,
    WOOCOMMERCE_API_URL: process.env.WOOCOMMERCE_API_URL || `https://${API_DOMAIN}/wp-json/wc/v3`,
    
    // Public site configuration
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://fitbody.mk',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'FitBody.mk',
    NEXT_PUBLIC_API_DOMAIN: API_DOMAIN,
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features
  experimental: {
    // Disable ESM externals for better compatibility
    esmExternals: false,
  },

  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here if needed
    if (!isServer) {
      // Client-side only configurations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
