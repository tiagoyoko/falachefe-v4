import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-client";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Testar conexão básica
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Testar se consegue fazer uma query simples
    const { data: testData, error: testError } = await supabase
      .from('user')
      .select('count')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      message: "Supabase connection test",
      results: {
        session: session ? "Session available" : "No session",
        sessionError: sessionError?.message || null,
        testQuery: testData ? "Query successful" : "Query failed",
        testError: testError?.message || null,
        supabaseUrl: process.env.falachefe_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!(process.env.falachefe_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Supabase connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
