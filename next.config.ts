import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@supabase/ssr', '@supabase/supabase-js')
    }
    return config
  }
};

export default nextConfig;
