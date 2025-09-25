import { NextResponse } from "next/server";

export async function GET() {
  // Verificar variáveis de ambiente no servidor
  const serverEnv = {
    falachefe_NEXT_PUBLIC_SUPABASE_URL: !!process.env.falachefe_NEXT_PUBLIC_SUPABASE_URL,
    falachefe_NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.falachefe_NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.falachefe_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
    hasAnonKey: !!(process.env.falachefe_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  };

  return NextResponse.json({
    message: "Client environment variables check",
    server: serverEnv,
    note: "Variáveis NEXT_PUBLIC_ devem estar disponíveis no cliente",
    timestamp: new Date().toISOString()
  });
}
