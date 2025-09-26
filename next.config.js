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
};

module.exports = nextConfig;
