import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  
  // Memory optimization for builds
  outputFileTracingRoot: undefined,
  
  images: {
    unoptimized: true
  },
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Suppress ESLint configuration warnings during build
    ignoreDuringBuilds: true, // Changed to true to save memory
  },
  experimental: {
    optimizePackageImports: ['react-i18next', 'lucide-react', 'framer-motion'],
    // Use SWC minifier which uses less memory than Terser
    swcMinify: true,
    // Reduce memory usage during build
    memoryBasedWorkers: false,
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack config for memory optimization
  webpack: (config, { isServer, dev }) => {
    // Reduce memory usage during build
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      // Limit parallel processing to reduce memory usage
      parallelism: 1,
      // Use less memory for minimize
      minimize: !dev,
      // Reduce memory pressure
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: {
        ...config.optimization.splitChunks,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
      },
    };
    
    // Limit webpack parallelism
    config.parallelism = 1;
    
    // Reduce memory usage for file system caching
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      },
      // Limit cache size to prevent memory issues
      maxMemoryGenerations: 1,
    };
    
    // Reduce bundle size
    if (!isServer && !dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
      };
    }
    
    return config;
  },
  
  allowedDevOrigins: ['*'],
  
  // API Proxy disabled - using production API directly
  // async rewrites() {
  //   if (process.env.NODE_ENV === 'development') {
  //     return [
  //       {
  //         source: '/api/:path*',
  //         destination: 'https://api.daleelbalady.com/:path*',
  //       },
  //     ];
  //   }
  //   return [];
  // },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: 'https://api.daleelbalady.com/api',
    NEXT_PUBLIC_DEV_API_URL: 'https://api.daleelbalady.com/api',
  },
  
  // For RTL support (temporarily disabled for build fix)
  // i18n: {
  //   locales: ['en', 'ar'],
  //   defaultLocale: 'ar',
  //   localeDetection: false,
  // },
  
  // Build ID
  async generateBuildId() {
    return 'daleel-balady-build'
  },
}
 
export default nextConfig
