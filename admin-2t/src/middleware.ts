import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

// 1. DEFINICIÓN DE RUTAS
// Rutas públicas (acceso libre sin login)
const publicRoutes = [
  '/login', 
  '/register', 
  '/signin', 
  '/signup',
  '/forgot-password',
  '/reset-password'
];

// Rutas exclusivas de ADMIN
const adminRoutes = [
  '/', // Dashboard admin
  '/calendar',
  '/profile',
  '/blank',
  '/charts',
  '/forms',
  '/tables',
  '/alerts',
  '/avatars',
  '/badge',
  '/buttons',
  '/images',
  '/modals',
  '/videos',
  '/wods',
  '/atletas',
  '/cuotas',
];

// Rutas exclusivas de ATHLETE
const athleteRoutes = [
  '/athlete' // Cubre /athlete y todas sus subrutas
];

// 2. FUNCIÓN PARA OBTENER ROL (Decodificando JWT localmente)
function getUserRole(token: string): string | null {
  try {
    // Decodificamos el token sin verificar firma (más rápido para middleware).
    // La seguridad real de datos la maneja el backend al recibir el token.
    const claims = decodeJwt(token);
    
    // Asumimos que el rol viene en 'role' o 'roles'. Ajustar según tu backend.
    // Común: 'role', 'https://hasura.io/jwt/claims', etc.
    const role = (claims.role as string) || (claims.roles as string[])?.[0];
    
    return role || null;
  } catch (error) {
    console.error('[Middleware] Error decodificando token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 3. LÓGICA FAIL-CLOSED (Bloquear por defecto)
  
  // A. Si es ruta pública, permitir siempre
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // B. Verificar Token
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    // Si intenta entrar a ruta protegida sin token -> Login
    // IMPORTANTE: Evitar redirect loops
    if (pathname !== '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      // Guardar la url original para redirigir después del login (opcional)
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // C. Obtener Rol
  const userRole = getUserRole(token);

  if (!userRole) {
    // Token existe pero no se pudo leer el rol (inválido/expirado) -> Login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // D. Control de Acceso por Rol

  // Caso 1: Rutas de ADMIN
  // Verificamos si la ruta actual empieza con alguna de las rutas de admin
  // Nota: '/' coincide con todo, así que lo manejamos con cuidado o usamos lógica específica
  const isAdminRoute = adminRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  if (isAdminRoute) {
    if (userRole !== 'ADMIN' && userRole !== 'COACH') {
      // Usuario no autorizado intenta entrar a zona Admin -> Redirigir a su dashboard
      return NextResponse.redirect(new URL('/athlete/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Caso 2: Rutas de ATHLETE
  const isAthleteRoute = athleteRoutes.some(route => pathname.startsWith(route));

  if (isAthleteRoute) {
    if (userRole !== 'ATHLETE') {
      // Admin intentando ver vista de atleta? O usuario normal?
      // Generalmente los admins pueden ver todo, pero si quieres estricto:
      if (userRole === 'ADMIN') {
        // Opcional: Permitir a admin ver vista de atleta o redirigir a admin dashboard
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // E. Rutas no clasificadas (pero autenticadas)
  // Si llegamos aquí, el usuario tiene token pero la ruta no está en listas explícitas.
  // En modelo Fail-Closed, deberíamos decidir qué hacer.
  // Opción 1: Permitir si está autenticado (riesgo medio)
  // Opción 2: Bloquear (seguridad máxima)
  
  // Por ahora, permitimos acceso a recursos generales si está autenticado,
  // pero podrías cambiar esto a redirect('/') si prefieres seguridad total.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
