/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "admin.aksharayurved.com",
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/static/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize for memory usage
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev to save memory
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for security and performance
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
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Proxy static files to backend
  // async rewrites() {
  //   return [
  //     {
  //       source: '/static/:path*',
  //       destination: 'http://localhost:9000/static/:path*',
  //     },
  //   ];
  // },

  // Webpack configuration for package optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          ayurveda: {
            test: /[\\/]src[\\/]lib[\\/]ayurveda[\\/]/,
            name: 'ayurveda',
            chunks: 'all',
          },
        },
      };
    }

    // Memory optimization for large static assets
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/images/[hash][ext][query]'
      }
    });

    // Increase memory limits for worker threads
    config.optimization.minimizer = config.optimization.minimizer || [];
    config.optimization.minimizer.forEach((plugin) => {
      if (plugin.constructor.name === 'TerserPlugin') {
        plugin.options.parallel = false; // Disable parallel processing to reduce memory usage
      }
    });

    return config;
  },

  // Experimental features
  experimental: {
    // Modern Next.js features are enabled by default in Next.js 14
    // No longer need concurrentFeatures, serverComponents, or appDir
    // Memory optimization
    workerThreads: false, // Disable worker threads to reduce memory usage
    cpus: 1, // Limit CPU usage during build
  },

  // Output configuration for better memory management
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Compiler options for memory optimization
  compiler: {
    // Remove console logs in production to reduce bundle size
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
