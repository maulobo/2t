# 🚀 Ejemplos de Uso - Sistema de Autenticación

## Ejemplos Completos de Frontend

### React/Next.js - Context de Autenticación

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'COACH' | 'ATHLETE';
  athlete?: any;
  coach?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isCoach: boolean;
  isAthlete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar usuario del localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isCoach: user?.role === 'COACH',
      isAthlete: user?.role === 'ATHLETE'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Hook para Fetch Autenticado

```typescript
// hooks/useAuthFetch.ts
import { useAuth } from '../contexts/AuthContext';

export function useAuthFetch() {
  const { token } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expirado o inválido
      // Redirigir a login
      window.location.href = '/login';
    }

    return response;
  };

  return { authFetch };
}
```

### Página de Login

```tsx
// pages/login.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard'); // Redirigir al dashboard
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Iniciar Sesión</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Componente de Perfil

```tsx
// components/UserProfile.tsx
import { useAuth } from '../contexts/AuthContext';
import { useAuthFetch } from '../hooks/useAuthFetch';
import { useState, useEffect } from 'react';

export function UserProfile() {
  const { user, logout, isCoach } = useAuth();
  const { authFetch } = useAuthFetch();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const response = await authFetch('http://localhost:3000/auth/me');
    const data = await response.json();
    setProfile(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>

      <div className="space-y-2">
        <p>
          <strong>Email:</strong> {profile?.email}
        </p>
        <p>
          <strong>Rol:</strong> {isCoach ? '🏋️ Coach' : '💪 Atleta'}
        </p>
        <p>
          <strong>ID:</strong> {profile?.id}
        </p>

        {isCoach && profile?.coach && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="font-semibold">Perfil de Coach</p>
            <p>Coach ID: {profile.coach.id}</p>
          </div>
        )}

        {!isCoach && profile?.athlete && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <p className="font-semibold">Perfil de Atleta</p>
            <p>Nombre: {profile.athlete.fullName}</p>
            <p>Altura: {profile.athlete.height} cm</p>
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
```

### Ruta Protegida (Higher Order Component)

```tsx
// components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: 'COACH' | 'ATHLETE';
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (requireRole && user?.role !== requireRole) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, user, requireRole]);

  if (!isAuthenticated) {
    return <div>Cargando...</div>;
  }

  if (requireRole && user?.role !== requireRole) {
    return <div>No autorizado</div>;
  }

  return <>{children}</>;
}

// Uso:
// <ProtectedRoute requireRole="COACH">
//   <CoachDashboard />
// </ProtectedRoute>
```

---

## Vanilla JavaScript (Sin Framework)

### Login Simple

```html
<!-- login.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Login</title>
  </head>
  <body>
    <h1>Iniciar Sesión</h1>

    <form id="loginForm">
      <input type="email" id="email" placeholder="Email" required />
      <input type="password" id="password" placeholder="Contraseña" required />
      <button type="submit">Iniciar Sesión</button>
    </form>

    <div id="message"></div>

    <script>
      document
        .getElementById('loginForm')
        .addEventListener('submit', async (e) => {
          e.preventDefault();

          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;

          try {
            const response = await fetch('http://localhost:3000/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
              // Guardar token
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);

              // Redirigir según el rol
              if (data.role === 'COACH') {
                window.location.href = '/coach-dashboard.html';
              } else {
                window.location.href = '/athlete-dashboard.html';
              }
            } else {
              document.getElementById('message').textContent =
                'Credenciales inválidas';
            }
          } catch (error) {
            document.getElementById('message').textContent =
              'Error al conectar';
          }
        });
    </script>
  </body>
</html>
```

### Dashboard con Datos Protegidos

```html
<!-- dashboard.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Dashboard</title>
  </head>
  <body>
    <h1>Mi Dashboard</h1>
    <div id="profile"></div>
    <button onclick="logout()">Cerrar Sesión</button>

    <script>
      // Verificar autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login.html';
      }

      // Cargar perfil
      async function loadProfile() {
        try {
          const response = await fetch('http://localhost:3000/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          document.getElementById('profile').innerHTML = `
          <p>Email: ${data.email}</p>
          <p>Rol: ${data.role}</p>
          <p>ID: ${data.id}</p>
        `;
        } catch (error) {
          console.error('Error al cargar perfil:', error);
        }
      }

      function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login.html';
      }

      // Cargar datos al iniciar
      loadProfile();
    </script>
  </body>
</html>
```

---

## Testing Manual con cURL

```bash
# 1. Registrar un coach
curl -X POST http://localhost:3000/auth/register-coach \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@test.com",
    "password": "123456",
    "phone": "123456789"
  }'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@test.com",
    "password": "123456"
  }'

# Copiar el token de la respuesta

# 3. Obtener perfil (reemplazar TOKEN)
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## Axios con Interceptors

```typescript
// api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// Uso:
// import api from './api/client';
// const response = await api.get('/auth/me');
```

---

## 🎯 Resumen de Flujos

### Flujo de Registro de Coach

1. Usuario llena formulario
2. Frontend → `POST /auth/register-coach`
3. Backend crea User + CoachProfile
4. Backend hashea password con bcrypt
5. Backend genera JWT token
6. Backend retorna `{ user, token, role }`
7. Frontend guarda token en localStorage
8. Redirige a dashboard

### Flujo de Login

1. Usuario ingresa email y password
2. Frontend → `POST /auth/login`
3. Backend busca usuario por email
4. Backend valida password con bcrypt
5. Backend genera JWT token
6. Backend retorna `{ user, token, role }`
7. Frontend guarda token
8. Redirige según rol (coach/atleta)

### Flujo de Request Autenticado

1. Frontend lee token de localStorage
2. Frontend → `GET /api/ruta` + `Authorization: Bearer token`
3. Backend valida token con JWT Strategy
4. Backend busca usuario en DB
5. Backend adjunta usuario a request (`req.user`)
6. Backend ejecuta lógica del endpoint
7. Backend retorna respuesta
