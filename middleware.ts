import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não exigem autenticação
const publicRoutes = ['/login', '/cadastro', '/api/auth', '/api/users'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pega o token de autenticação do cookie
  const sessionToken = request.cookies.get('session_token')?.value;
  const isPublicRoute = publicRoutes.some(path => pathname.startsWith(path));

  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionToken && (pathname === '/login' || pathname === '/cadastro')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configuração para o middleware 
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};