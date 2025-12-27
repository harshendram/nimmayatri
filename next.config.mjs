/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["maps.googleapis.com"],
  },
  // Optimize for production
  swcMinify: true,
  reactStrictMode: true,

  // Prevent chunk loading errors
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
