# 🏃 Vista de Atletas - Guía Completa

## 📋 Resumen

Se ha creado una vista completa para listar y gestionar atletas en tu aplicación de administración, integrada con tu backend de NestJS y el esquema de Prisma.

## 🎯 ¿Qué se creó?

### 1️⃣ Frontend (Next.js + TypeScript)

#### Archivos principales:
- ✅ **`/src/app/(admin)/(others-pages)/atletas/page.tsx`** - Página principal con lógica real
- ✅ **`/src/app/(admin)/(others-pages)/atletas/page.mock.tsx`** - Versión demo con datos mock
- ✅ **`/src/components/tables/AthletesTable.tsx`** - Componente de tabla reutilizable
- ✅ **`/src/types/athlete.ts`** - Tipos TypeScript
- ✅ **`/src/data/mockAthletes.ts`** - Datos de prueba

#### Features implementadas:
- 🔍 Búsqueda por nombre o email
- 🎛️ Filtros por estado (Todos/Activos/Inactivos)
- 📄 Paginación
- 👁️ Ver detalles del atleta
- ✏️ Editar atleta
- 🗑️ Eliminar atleta
- ⚡ Loading states
- ❌ Error handling
- 🌓 Soporte dark/light mode
- 📱 Diseño responsive

## 🚀 Cómo empezar

### Opción 1: Testing con datos mock (recomendado para empezar)

1. **Ir a la página:**
   ```
   http://localhost:3000/atletas
   ```

2. **Cambiar a modo mock:**
   Edita `/src/app/(admin)/(others-pages)/atletas/page.tsx`:
   ```typescript
   const USE_MOCK_DATA = true; // Cambiar de false a true
   ```

3. **¡Ya está!** Verás 8 atletas de ejemplo con datos realistas.

### Opción 2: Conectar con el backend real

1. **Configurar variables de entorno:**
   ```bash
   # Editar .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Implementar el backend:**
   Ver instrucciones detalladas en `BACKEND_IMPLEMENTATION.md`

3. **Asegurarse que USE_MOCK_DATA esté en false:**
   ```typescript
   const USE_MOCK_DATA = false;
   ```

4. **Iniciar el servidor de Next.js:**
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

## 📊 Datos mostrados

Para cada atleta se visualiza:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **Atleta** | Nombre completo y email | Juan Pérez<br/>juan@example.com |
| **Edad** | Calculada desde birthDate | 28 años |
| **Contacto** | Teléfono | +5491112345678 |
| **Estado** | Badge verde/rojo | 🟢 Activo / 🔴 Inactivo |
| **WODs** | Cantidad de WODs asignados | 12 |
| **Pagos** | Cantidad de pagos realizados | 5 |
| **Acciones** | Botones de acción | 👁️ ✏️ 🗑️ |

## 🔌 Integración con Backend

### Endpoint requerido:

```typescript
GET /api/athletes?page=1&pageSize=10&search=nombre&active=true

Response:
{
  "athletes": [...],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### Implementación en NestJS:

Ver el archivo `BACKEND_IMPLEMENTATION.md` para:
- ✅ Código completo del Controller
- ✅ Código completo del Service
- ✅ Configuración de Prisma
- ✅ Manejo de CORS

## 🎨 Características visuales

### Estados de la UI:

1. **Loading**: Spinner animado mientras carga
2. **Error**: Banner rojo con mensaje de error
3. **Vacío**: Mensaje "No se encontraron atletas"
4. **Datos**: Tabla completa con paginación

### Badges de estado:

- 🟢 **Verde (Activo)**: Atleta está activo en el gimnasio
- 🔴 **Rojo (Inactivo)**: Atleta está inactivo o suspendido

### Botones de acción:

- **👁️ Ver**: Vista de detalles completos (TODO)
- **✏️ Editar**: Modificar información (TODO)
- **🗑️ Eliminar**: Eliminar con confirmación (implementado)

## 📱 Responsive Design

- **Desktop (>1024px)**: Vista completa con todas las columnas
- **Tablet (768-1024px)**: Scroll horizontal si es necesario
- **Mobile (<768px)**: Optimizado con columnas esenciales

## 🔄 Próximos pasos

### Features pendientes (TODOs):

1. **Página de detalles del atleta**
   - Crear `/atletas/[id]/page.tsx`
   - Mostrar información completa
   - Historial de pagos
   - WODs asignados
   - Gráficos de progreso

2. **Modal/Página de edición**
   - Formulario con validación
   - Actualización en tiempo real
   - Subida de foto de perfil

3. **Modal/Página de creación**
   - Formulario para nuevo atleta
   - Validación de email único
   - Asignación de coach

4. **Exportar datos**
   - Exportar a CSV
   - Exportar a Excel
   - Filtros aplicados

5. **Estadísticas**
   - Total de atletas activos/inactivos
   - Gráficos de crecimiento
   - Métricas de pagos

## 🛠️ Tecnologías utilizadas

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**
- **Fetch API**

## 📁 Estructura de archivos creados

```
admin-2t/
├── src/
│   ├── app/
│   │   └── (admin)/
│   │       └── (others-pages)/
│   │           └── atletas/
│   │               ├── page.tsx         # Página principal
│   │               └── page.mock.tsx    # Versión demo
│   ├── components/
│   │   └── tables/
│   │       └── AthletesTable.tsx        # Tabla de atletas
│   ├── types/
│   │   └── athlete.ts                   # Interfaces TypeScript
│   └── data/
│       └── mockAthletes.ts              # Datos de prueba
├── .env.local                            # Variables de entorno
├── .env.example                          # Ejemplo de variables
├── BACKEND_IMPLEMENTATION.md             # Guía del backend
├── FRONTEND_ATHLETES.md                  # Doc del frontend
└── GETTING_STARTED_ATHLETES.md          # Este archivo
```

## 🐛 Troubleshooting

### Problema: "No se encontraron atletas"

**Solución:**
1. Verificar que el backend esté corriendo
2. Revisar la URL en `.env.local`
3. Activar modo mock para testing: `USE_MOCK_DATA = true`

### Problema: Error de CORS

**Solución:**
Configurar CORS en el backend (ver `BACKEND_IMPLEMENTATION.md`):
```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  credentials: true,
});
```

### Problema: Datos no se actualizan

**Solución:**
1. Recargar la página
2. Verificar la consola del navegador
3. Revisar los Network requests en DevTools

## 📞 Acciones implementadas

### ✅ Eliminar atleta
- Confirmación antes de eliminar
- Petición DELETE al backend
- Recarga automática de la lista

### ⏳ Ver detalles (TODO)
```typescript
const handleViewDetails = (athleteId: string) => {
  router.push(`/atletas/${athleteId}`);
};
```

### ⏳ Editar atleta (TODO)
```typescript
const handleEdit = (athlete: Athlete) => {
  // Abrir modal o navegar a formulario
  router.push(`/atletas/${athlete.id}/editar`);
};
```

## 🎯 Testing

### Probar con datos mock:
```typescript
// En page.tsx
const USE_MOCK_DATA = true;
```

### Probar filtros:
1. Hacer clic en "Activos" → Solo atletas activos
2. Hacer clic en "Inactivos" → Solo atletas inactivos
3. Hacer clic en "Todos" → Todos los atletas

### Probar búsqueda:
1. Escribir nombre: "Juan"
2. Escribir email: "@example.com"
3. Click en "Buscar"

### Probar paginación:
1. Si hay más de 10 atletas
2. Click en números de página
3. Click en "Next"/"Previous"

## 📚 Documentación adicional

- **Backend:** Ver `BACKEND_IMPLEMENTATION.md`
- **Frontend:** Ver `FRONTEND_ATHLETES.md`
- **Prisma Schema:** Ya está en tu proyecto

## ✨ Resultado final

Al acceder a `/atletas` verás:

```
┌─────────────────────────────────────────────────┐
│ Atletas                              Home > Atletas │
├─────────────────────────────────────────────────┤
│ [🔍 Buscar...] [Todos][Activos][Inactivos][+]  │
├─────────────────────────────────────────────────┤
│ Lista de Atletas                                │
│ ┌───────────────────────────────────────────┐  │
│ │ Atleta    │ Edad │ Contacto │ Estado │... │  │
│ ├───────────────────────────────────────────┤  │
│ │ Juan Pérez│ 28   │ +549111.. │ 🟢     │... │  │
│ │ María G.  │ 31   │ +549119.. │ 🟢     │... │  │
│ └───────────────────────────────────────────┘  │
│            [<] [1] [2] [3] [>]                 │
└─────────────────────────────────────────────────┘
```

## 🎉 ¡Listo!

Ya tienes una vista completa de atletas. Para agregar más funcionalidades, consulta la sección "Próximos pasos" arriba.

---

**¿Preguntas?** Revisa `FRONTEND_ATHLETES.md` o `BACKEND_IMPLEMENTATION.md`
