# Página de Atletas - Frontend

## 📁 Archivos Creados

### 1. **Página Principal**
- **Ubicación:** `/src/app/(admin)/(others-pages)/atletas/page.tsx`
- **Descripción:** Página principal que lista todos los atletas con filtros, búsqueda y paginación
- **Features:**
  - ✅ Listado de atletas con datos completos
  - ✅ Búsqueda por nombre o email
  - ✅ Filtros por estado (Todos/Activos/Inactivos)
  - ✅ Paginación
  - ✅ Botones de acción (Ver, Editar, Eliminar)
  - ✅ Loader mientras carga datos
  - ✅ Manejo de errores

### 2. **Componente de Tabla**
- **Ubicación:** `/src/components/tables/AthletesTable.tsx`
- **Descripción:** Componente reutilizable para mostrar la tabla de atletas
- **Columnas:**
  - Nombre completo y email
  - Edad (calculada desde birthDate)
  - Teléfono de contacto
  - Estado (Activo/Inactivo) con badge de color
  - Cantidad de WODs asignados
  - Cantidad de pagos realizados
  - Acciones (Ver, Editar, Eliminar)

### 3. **Tipos TypeScript**
- **Ubicación:** `/src/types/athlete.ts`
- **Descripción:** Interfaces TypeScript para los atletas y respuestas del API

### 4. **Variables de Entorno**
- **Ubicación:** `.env.local` y `.env.example`
- **Variable:** `NEXT_PUBLIC_API_URL`

### 5. **Documentación del Backend**
- **Ubicación:** `BACKEND_IMPLEMENTATION.md`
- **Descripción:** Guía completa para implementar el backend en NestJS

## 🚀 Cómo usar

### 1. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con la URL de tu backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Acceder a la página
Navega a: `http://localhost:3000/atletas`

## 🔌 Integración con Backend

La página espera que el backend de NestJS tenga implementado el endpoint:

```
GET /api/athletes?page=1&pageSize=10&search=nombre&active=true
```

Ver `BACKEND_IMPLEMENTATION.md` para la implementación completa.

## 🎨 Características de UI

### Filtros
- **Todos:** Muestra todos los atletas
- **Activos:** Solo atletas con `active: true`
- **Inactivos:** Solo atletas con `active: false`

### Búsqueda
Busca en tiempo real por:
- Nombre completo
- Email

### Estados visuales
- 🟢 **Badge Verde:** Atleta activo
- 🔴 **Badge Rojo:** Atleta inactivo

### Acciones disponibles
- 👁️ **Ver detalles:** Ver información completa del atleta
- ✏️ **Editar:** Modificar datos del atleta
- 🗑️ **Eliminar:** Eliminar atleta (con confirmación)

## 📊 Datos mostrados

Para cada atleta se muestra:
- **Nombre completo**
- **Email**
- **Edad** (calculada automáticamente desde la fecha de nacimiento)
- **Teléfono**
- **Estado** (Activo/Inactivo)
- **WODs asignados** (contador)
- **Pagos realizados** (contador)

## 🔄 Próximos pasos (TODOs)

Las siguientes funcionalidades están preparadas pero requieren implementación:

1. **Ver detalles del atleta**
   - Crear página `/atletas/[id]` para mostrar información detallada
   - Historial de pagos
   - WODs asignados
   - Notas del coach

2. **Editar atleta**
   - Modal o página para editar información
   - Formulario con validación

3. **Agregar nuevo atleta**
   - Modal o página con formulario
   - Integración con el endpoint POST del backend

4. **Exportar datos**
   - Exportar lista a CSV/Excel

## 🎯 Ejemplo de datos esperados del backend

```json
{
  "athletes": [
    {
      "id": "clx123abc",
      "userId": "clx456def",
      "fullName": "Juan Pérez",
      "birthDate": "1995-05-15T00:00:00.000Z",
      "notes": "Principiante en CrossFit",
      "active": true,
      "coachId": "clx789ghi",
      "user": {
        "email": "juan.perez@example.com",
        "phone": "+5491112345678"
      },
      "coach": {
        "user": {
          "email": "coach@example.com"
        }
      },
      "_count": {
        "payments": 5,
        "assignments": 12
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

## 🎨 Tema Dark/Light

La página soporta automáticamente el tema oscuro/claro del template, adaptando:
- Colores de fondo
- Textos
- Borders
- Botones
- Badges

## 📱 Responsive

El diseño es completamente responsive:
- **Desktop:** Vista completa con todos los datos
- **Tablet:** Scroll horizontal si es necesario
- **Mobile:** Optimizado para pantallas pequeñas
