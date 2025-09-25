import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware temporariamente desabilitado - sem validação de autenticação
  console.log("Middleware: Permitindo acesso sem validação de autenticação");
  
  return NextResponse.next({
    request,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
