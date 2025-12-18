# 🔐 Guía de Implementación Frontend: Autenticación y Recuperación de Contraseña

Esta guía detalla cómo implementar las pantallas y la lógica para el flujo de autenticación, específicamente la recuperación de contraseña.

## 1. Pantalla: "Olvidé mi Contraseña"

**Ruta sugerida:** `/forgot-password`

### UI Requerida
- **Input:** Email (tipo email, requerido).
- **Botón:** "Enviar instrucciones" o "Recuperar contraseña".
- **Link:** "Volver al Login" (para cancelar).

### Lógica
1. El usuario ingresa su email.
2. Al enviar el formulario, hacer una petición POST al backend.
3. Mostrar un mensaje de éxito indicando que revise su correo.

**Endpoint:**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@ejemplo.com"
}
```

**Manejo de Respuesta:**
- **Éxito (201):** Mostrar mensaje: *"Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña en breve."*
- **Error:** Manejar errores de red genéricos.

---

## 2. Pantalla: "Restablecer Contraseña"

**Ruta sugerida:** `/reset-password`
**Query Param:** Debe recibir el token por URL, ej: `/reset-password?token=xyz123...`

### UI Requerida
- **Input:** Nueva Contraseña (tipo password, requerido).
- **Input:** Confirmar Nueva Contraseña (tipo password, requerido).
- **Botón:** "Cambiar Contraseña".

### Lógica
1. Al cargar la página, **leer el query param `token`** de la URL.
   - Si no hay token, mostrar error o redirigir a `/forgot-password`.
2. Validar que las dos contraseñas coincidan.
3. Al enviar, hacer la petición POST al backend con el token y la nueva contraseña.

**Endpoint:**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "el_token_obtenido_de_la_url",
  "newPassword": "la_nueva_contraseña"
}
```

**Manejo de Respuesta:**
- **Éxito (201):** 
  - Mostrar mensaje: *"Tu contraseña ha sido actualizada correctamente."*
  - Redirigir al Login (`/login`) después de 2-3 segundos.
- **Error (401 Unauthorized):** 
  - El token es inválido o ha expirado.
  - Mostrar mensaje: *"El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo."*
  - Botón para ir a `/forgot-password`.

---

## 3. Ejemplo de Código (React + Fetch)

### Hook para Olvidé mi Contraseña

```typescript
const requestPasswordReset = async (email: string) => {
  try {
    const response = await fetch('http://localhost:3000/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    // Siempre retornamos true para no revelar usuarios
    return true; 
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};
```

### Hook para Resetear Contraseña

```typescript
const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch('http://localhost:3000/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al restablecer contraseña');
  }

  return await response.json();
};
```

### Lectura del Token (React Router)

```typescript
import { useSearchParams } from 'react-router-dom';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return <p>Token inválido.</p>;
  }

  // ... renderizar formulario
}
```
