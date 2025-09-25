import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: "Variáveis de ambiente não configuradas",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Testar conectividade básica
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Testar se consegue fazer uma query simples
    const { data: testData, error: testError } = await supabase
      .from('user')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Teste de conectividade Supabase",
      results: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        anonKeyLength: supabaseAnonKey.length,
        session: session ? "Session available" : "No session",
        sessionError: sessionError?.message || null,
        testQuery: testData ? "Query successful" : "Query failed",
        testError: testError?.message || null,
        testErrorCode: testError?.code || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Erro no teste de conectividade",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
