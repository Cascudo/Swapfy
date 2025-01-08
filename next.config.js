/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    if (!isServer) config.resolve.fallback.fs = false;

    config.devtool = 'source-map';
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [],
  // Add font optimization
  optimizeFonts: true,
  // Add security headers for font loading
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Font-Control-Allow-Origin',
            value: '*'
          }
        ],
      },
    ]
  }
};

module.exports = nextConfig;