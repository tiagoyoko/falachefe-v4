import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email e senha são obrigatórios"
      }, { status: 400 });
    }

    // Usar cliente direto do Supabase para teste
    const supabaseUrl = process.env.falachefe_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.falachefe_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: "Variáveis de ambiente do Supabase não configuradas"
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Tentar criar conta
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Erro ao criar conta",
        error: error.message,
        details: error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Conta criada com sucesso",
      data: {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at
        } : null,
        session: data.session ? "Session created" : "No session"
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
