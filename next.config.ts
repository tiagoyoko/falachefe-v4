import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],
  experimental: {
    // Força o uso do Node.js runtime para evitar problemas com Edge Runtime
    serverComponentsExternalPackages: [
      "@supabase/ssr",
      "@supabase/supabase-js",
    ],
  },
  // Configuração para evitar warnings do Edge Runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir módulos problemáticos do Edge Runtime
      config.externals = config.externals || [];
      config.externals.push({
        "@supabase/realtime-js": "commonjs @supabase/realtime-js",
        "@supabase/supabase-js": "commonjs @supabase/supabase-js",
      });
    }
    return config;
  },
};

export default nextConfig;
