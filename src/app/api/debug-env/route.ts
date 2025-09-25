import { NextResponse } from 'next/server';

export async function GET() {
  // Verificar variáveis de ambiente (apenas para debug)
  const envCheck = {
    hasFalachefeSupabaseUrl: !!process.env.falachefe_NEXT_PUBLIC_SUPABASE_URL,
    hasFalachefeSupabaseKey: !!process.env.falachefe_NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasFalachefePostgresUrl: !!process.env.falachefe_POSTGRES_URL,
    hasRegularSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasRegularSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasRegularPostgresUrl: !!process.env.POSTGRES_URL,
    supabaseUrl: process.env.falachefe_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_FOUND',
    postgresUrl: process.env.falachefe_POSTGRES_URL || process.env.POSTGRES_URL || 'NOT_FOUND',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json({
    message: 'Environment variables debug',
    env: envCheck,
    timestamp: new Date().toISOString()
  });
}
