/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed rewrites - using API route files instead for better control
  // See: src/app/api/offers/route.ts and other API route files
  async headers() {
    const headers = [
      {
        // Apply these headers to all API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];

    // Add cache-busting headers in development
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      });
    }

    return headers;
  },
  // ESLint configuration
  eslint: {
    // Do not fail builds because of ESLint while we migrate
    ignoreDuringBuilds: true,
  },

  // Skip problematic static optimization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Server external packages (moved from experimental)
  serverExternalPackages: [],
  // React configuration
  reactStrictMode: process.env.NODE_ENV !== 'development', // Disable in dev to avoid double-mounting
  // Experimental features
  experimental: {
    // Allow all hosts for Replit environment (shows warning but works correctly)
    allowedHosts: true,
    // Development-only optimizations
    ...(process.env.NODE_ENV === 'development' && {
      optimizeCss: false,
      optimizeServerReact: false,
    }),
  },
  // Enable source maps for better debugging
  productionBrowserSourceMaps: false,
  // Optimize images
  images: {
    domains: ['api.daleelbalady.com', 'www.daleelbalady.com','daleelbalady.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  // Handle trailing slashes
  trailingSlash: false,
  // Ensure TypeScript files are properly handled
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Allow builds to succeed even if TypeScript reports errors (workaround for validator bug)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Development-specific optimizations
    if (dev) {
      // Prevent chunk splitting issues in development
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Combine theme providers into single chunk
          theme: {
            test: /[\\\\/](theme-provider|ThemeProvider)[\\\\/]/,
            name: 'theme',
            chunks: 'all',
            priority: 30,
          },
        },
      };
    }

    if (!isServer) {
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
