import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth-client";

export async function middleware(request: NextRequest) {
  // Verificar se é uma rota de admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    try {
      const session = await getSession();

      if (!session?.data?.user?.id) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }

      // Verificar se o usuário é admin
      const userRole = (session.data.user as { role?: string }).role || "user";
      if (userRole !== "admin" && userRole !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Erro no middleware de admin:", error);
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
