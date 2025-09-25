import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // No cliente, usar apenas variáveis NEXT_PUBLIC_ que são expostas pelo Vercel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback para desenvolvimento quando variáveis não estão configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables not configured. Using fallback values."
    );
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
