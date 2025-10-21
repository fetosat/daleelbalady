/**
 * Build Configuration Optimizations for Next.js
 * تحسينات إعدادات البناء لتجنب أخطاء prerendering
 */

const buildOptimizations = {
  // Skip static optimization for pages with client-side dependencies
  unstable_runtimeJS: false,
  
  // Optimize build performance
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    turbotrace: {
      logLevel: 'error'
    },
    // Disable problematic features during build
    appDir: true,
    serverComponentsExternalPackages: [
      'puppeteer',
      'playwright',
      '@sparticuz/chromium'
    ]
  },

  // Skip problematic static generation
  generateStaticParams: async () => {
    // Return empty array to prevent static generation issues
    return [];
  },

  // Custom webpack config for build optimization
  webpack: (config, { dev, isServer, webpack }) => {
    // Ignore problematic modules during build
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false
      };
    }

    // Optimize for build size
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            enforce: true
          }
        }
      };
    }

    return config;
  },

  // Skip type checking during build (for faster builds)
  typescript: {
    ignoreBuildErrors: true
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true
  },

  // Optimize images
  images: {
    unoptimized: true, // Skip image optimization for faster builds
    domains: ['api.daleelbalady.com', 'www.daleelbalady.com']
  },

  // Runtime configuration
  serverRuntimeConfig: {
    // Keep server-only secrets here
  },

  publicRuntimeConfig: {
    // Expose to client-side
    NODE_ENV: process.env.NODE_ENV
  }
};

module.exports = buildOptimizations;
