"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { AuthUser, AuthContextType, LoginCredentials, AuthResponse, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación leyendo cookie httpOnly (GET /auth/me)
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[Auth] Verificando autenticación con:', process.env.NEXT_PUBLIC_API_URL || 'URL por defecto');
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser(data);
      console.log('[Auth] ✅ Usuario autenticado:', data.email, data.role);
    } catch (error) {
      // 401 es esperado cuando no hay sesión, no es un error
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        console.log('[Auth] ❌ No hay sesión activa (401 esperado)');
      } else {
        console.error('[Auth] ⚠️ Error verificando autenticación:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login - El backend envía cookie automáticamente
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      console.log('[Auth] Iniciando login...');
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      setUser(data.user);
      console.log('[Auth] Login exitoso:', data.user.email, 'Rol:', data.user.role);

      // En mobile, usar window.location.href directamente (más confiable)
      const targetUrl = (data.user.role === 'ADMIN' || data.user.role === 'COACH') ? '/' : '/athlete/dashboard';
      console.log('[Auth] Redirigiendo a:', targetUrl);
      
      // Usar window.location.href en lugar de router.replace para evitar loops en mobile
      window.location.href = targetUrl;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message: string };
      console.error('[Auth] Error en login:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Error al iniciar sesión');
    }
  }, [router]);

  // Logout - El backend elimina la cookie
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      console.log('[Auth] Logout exitoso');
      router.push('/login');
    } catch (error) {
      console.error('[Auth] Error en logout:', error);
      // Igualmente limpiar estado local
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Verificar auth al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

// Hook para proteger páginas que requieren autenticación
export function useRequireAuth(requiredRole?: UserRole | UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // console.log('[useRequireAuth] Estado:', { isLoading, user: user?.email, role: user?.role, requiredRole });
    
    if (!isLoading) {
      if (!user) {
        // No autenticado → login
        console.log('[useRequireAuth] No hay usuario, redirigiendo a /login');
        router.replace('/login');
        return;
      }
      
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        if (!roles.includes(user.role)) {
          // Autenticado pero rol incorrecto → dashboard correspondiente
          console.log('[useRequireAuth] Rol incorrecto, redirigiendo');
          if (user.role === 'ADMIN' || user.role === 'COACH') {
            router.replace('/');
          } else {
            router.replace('/athlete/dashboard');
          }
        } else {
          // console.log('[useRequireAuth] ✅ Acceso permitido');
        }
      } else {
        // console.log('[useRequireAuth] ✅ Acceso permitido (sin rol específico)');
      }
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading };
}
