# 🍪 Autenticación con HttpOnly Cookies - Guía Frontend

## ¿Qué cambió?

Antes usábamos `localStorage` para guardar el token. Ahora usamos **HttpOnly Cookies** que es mucho más seguro.

### ❌ Antes (localStorage - Vulnerable a XSS)

```javascript
// Login
const response = await fetch('/auth/login', { ... });
const data = await response.json();
localStorage.setItem('token', data.token); // ← Vulnerable

// Request
fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```

### ✅ Ahora (HttpOnly Cookies - Seguro)

```javascript
// Login
const response = await fetch('/auth/login', {
  method: 'POST',
  credentials: 'include', // ← Solo esto!
  body: JSON.stringify({ email, password }),
});

// Request
fetch('/api/data', {
  credentials: 'include', // ← Solo esto!
});

// NO necesitas guardar ni leer el token manualmente
```

---

## 🚀 Implementación en el Frontend

### 1. React/Next.js - Context Actualizado

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isCoach: boolean;
  isAthlete: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/me', {
        credentials: 'include', // ← Envía la cookie automáticamente
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ← Recibe la cookie
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();
    setUser(data.user);
    // NO guardamos token - está en la cookie HttpOnly
  };

  const logout = async () => {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include', // ← Envía la cookie para eliminarla
    });

    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      checkAuth,
      isAuthenticated: !!user,
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

### 2. Hook para Fetch con Cookies

```typescript
// hooks/useAuthFetch.ts
export function useAuthFetch() {
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // ← SIEMPRE incluir esto
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Cookie expirada o inválida - redirigir a login
      window.location.href = '/login';
    }

    return response;
  };

  return { authFetch };
}

// Uso:
const { authFetch } = useAuthFetch();
const response = await authFetch('http://localhost:3000/api/athletes');
```

### 3. Página de Login Simplificada

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
      router.push('/dashboard');
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
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 4. Axios con Cookies

```typescript
// api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // ← Importante: envía cookies automáticamente
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// Uso (sin headers de Authorization):
import api from './api/client';
const response = await api.get('/auth/me');
```

---

## 🌐 Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Login con Cookies</title>
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
              credentials: 'include', // ← Cookie se guarda automáticamente
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
              // NO necesitas guardar nada en localStorage
              // La cookie se guarda automáticamente
              window.location.href = '/dashboard.html';
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

---

## 🔒 Seguridad

### Flags de la Cookie

```typescript
response.cookie('access_token', token, {
  httpOnly: true, // ✅ No accesible desde JavaScript (protección XSS)
  secure: true, // ✅ Solo HTTPS en producción
  sameSite: 'lax', // ✅ Protección CSRF básica
  maxAge: 604800000, // ✅ 7 días
  path: '/', // ✅ Disponible en toda la app
});
```

### Comparación de Seguridad

| Característica           | localStorage | HttpOnly Cookie |
| ------------------------ | ------------ | --------------- |
| Accesible desde JS       | ✅ Sí        | ❌ No           |
| Vulnerable a XSS         | ❌ Sí        | ✅ No           |
| Se envía automáticamente | ❌ No        | ✅ Sí           |
| Protección CSRF          | ❌ No        | ✅ Con SameSite |
| Persiste entre sesiones  | ✅ Sí        | ✅ Sí           |

---

## ⚠️ Consideraciones Importantes

### 1. CORS debe estar configurado correctamente

```typescript
// Backend (main.ts)
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true, // ← IMPORTANTE
});
```

### 2. Frontend debe usar `credentials: 'include'`

```javascript
// En TODAS las requests:
fetch(url, {
  credentials: 'include', // ← SIEMPRE
});

// Con Axios:
axios.create({
  withCredentials: true, // ← SIEMPRE
});
```

### 3. En producción, usar HTTPS

```typescript
response.cookie('access_token', token, {
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
});
```

---

## 🧪 Testing

### cURL

```bash
# Login (guarda cookie automáticamente con -c)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "coach@test.com", "password": "123456"}' \
  -c cookies.txt

# Usar cookie guardada (con -b)
curl http://localhost:3000/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

### Chrome DevTools

1. Abre DevTools → Application → Cookies
2. Deberías ver `access_token` con:
   - ✅ HttpOnly: true
   - ✅ Secure: false (en desarrollo)
   - ✅ SameSite: Lax

---

## 📋 Checklist de Migración

Si ya tenías implementación con localStorage:

- [ ] Actualizar todos los `fetch` con `credentials: 'include'`
- [ ] Eliminar código de `localStorage.setItem('token', ...)`
- [ ] Eliminar código de `localStorage.getItem('token')`
- [ ] Eliminar headers `Authorization: Bearer ...`
- [ ] Actualizar Context/Store para no guardar token
- [ ] Agregar `checkAuth()` al inicio de la app
- [ ] Probar login → refresh → debería seguir autenticado

---

## ✅ Ventajas de HttpOnly Cookies

1. **Seguridad contra XSS**: JavaScript no puede acceder al token
2. **Automático**: No necesitas gestionar el token manualmente
3. **Persistencia**: Funciona igual entre reloads
4. **Protección CSRF**: Con flag `sameSite`
5. **Estándar de la industria**: Usado por grandes aplicaciones

---

## 🚀 Resumen

**Lo que cambió:**

- ✅ Token viaja en cookie HttpOnly (no en body ni headers)
- ✅ Frontend NO guarda el token
- ✅ SIEMPRE usar `credentials: 'include'`
- ✅ Logout elimina la cookie del servidor

**Lo que NO cambió:**

- Los endpoints siguen siendo los mismos
- La lógica de negocio es la misma
- JWT sigue siendo el mecanismo de autenticación
