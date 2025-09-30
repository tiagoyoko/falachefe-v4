/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'webworker-threads': path.resolve(__dirname, 'empty-module.js'),
    };
    config.externals = config.externals || [];
    config.externals.push({ 'webworker-threads': 'commonjs webworker-threads' });
    return config;
  },
  // Excluir clickup-mcp-server do build
  experimental: {
    externalDir: true,
  },
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' chrome-extension://f12922d5-02d0-404e-b2dc-194ceb08ed0f/; object-src 'none';"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
