# 🎯 Vista de Atletas - Instalación Completa

## ✅ ¡TODO LISTO!

Se ha creado exitosamente la vista de atletas con todas las funcionalidades básicas.

---

## 📍 Acceso a la página

### Opción 1: Desde el Sidebar (Menú lateral)
1. Abre la aplicación: `http://localhost:3000`
2. En el menú lateral verás: **"👥 Atletas"**
3. Haz clic para acceder

### Opción 2: URL directa
Navega a: `http://localhost:3000/atletas`

---

## 🎨 Cambios realizados en el Sidebar

Se agregó una nueva entrada en el menú principal:

```typescript
{
  icon: <GroupIcon />,
  name: "Atletas",
  path: "/atletas",
}
```

**Ubicación en el menú:**
- Dashboard
- Calendar
- User Profile
- **👥 Atletas** ← NUEVO
- Forms
- Tables
- Pages

---

## 🚀 Modo de uso

### Para empezar con datos de prueba (RECOMENDADO):

1. **Edita**: `/src/app/(admin)/(others-pages)/atletas/page.tsx`
   ```typescript
   const USE_MOCK_DATA = true; // ← Cambia a true
   ```

2. **Navega** al sidebar y haz clic en "Atletas"

3. **Verás**: 8 atletas de ejemplo con datos realistas

### Para conectar con el backend real:

1. **Asegúrate** de tener `.env.local` configurado:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Implementa** el endpoint en NestJS (ver `BACKEND_IMPLEMENTATION.md`)

3. **Mantén** `USE_MOCK_DATA = false` en el código

4. **Inicia** ambos servidores:
   ```bash
   # Terminal 1 - Backend (NestJS)
   npm run start:dev
   
   # Terminal 2 - Frontend (Next.js)
   npm run dev
   ```

---

## 🎯 Funcionalidades disponibles

### ✅ Implementadas
- [x] Listado de atletas en tabla
- [x] Búsqueda por nombre o email
- [x] Filtros: Todos / Activos / Inactivos
- [x] Paginación (10 items por página)
- [x] Eliminar atleta (con confirmación)
- [x] Loading spinner
- [x] Manejo de errores
- [x] Responsive design
- [x] Dark/Light mode
- [x] Integración con sidebar
- [x] Datos mock para testing

### ⏳ Pendientes (TODOs)
- [ ] Ver detalles del atleta → Crear página `/atletas/[id]`
- [ ] Editar atleta → Agregar formulario de edición
- [ ] Agregar nuevo atleta → Agregar formulario de creación
- [ ] Exportar datos → CSV/Excel
- [ ] Estadísticas y gráficos

---

## 📊 Columnas de la tabla

| Columna | Descripción | Origen de datos |
|---------|-------------|-----------------|
| **Atleta** | Nombre completo + email | `fullName`, `user.email` |
| **Edad** | Calculada desde birthDate | `birthDate` (auto-calculado) |
| **Contacto** | Teléfono | `user.phone` |
| **Estado** | Badge Activo/Inactivo | `active` |
| **WODs** | Cantidad de WODs asignados | `_count.assignments` |
| **Pagos** | Cantidad de pagos | `_count.payments` |
| **Acciones** | Botones Ver/Editar/Eliminar | - |

---

## 🔧 Estructura del proyecto

```
src/
├── app/(admin)/(others-pages)/
│   └── atletas/
│       ├── page.tsx          ← Página principal (usa esta)
│       └── page.mock.tsx     ← Versión demo alternativa
├── components/
│   └── tables/
│       └── AthletesTable.tsx ← Componente de tabla
├── types/
│   └── athlete.ts            ← Interfaces TypeScript
├── data/
│   └── mockAthletes.ts       ← Datos de prueba
└── layout/
    └── AppSidebar.tsx        ← Menú lateral (modificado)
```

---

## 🎨 Personalización

### Cambiar items por página:
```typescript
// En page.tsx
const params = new URLSearchParams({
  page: currentPage.toString(),
  pageSize: "20", // ← Cambia de 10 a 20
});
```

### Cambiar colores de los badges:
```typescript
// En AthletesTable.tsx
<Badge
  size="sm"
  color={athlete.active ? "success" : "error"} // success=verde, error=rojo
>
```

### Agregar más filtros:
```typescript
// Ejemplo: filtro por coach
const [selectedCoach, setSelectedCoach] = useState("");

if (selectedCoach) {
  params.append("coachId", selectedCoach);
}
```

---

## 🧪 Testing

### Test 1: Modo Mock
```typescript
// page.tsx
const USE_MOCK_DATA = true;
```
✅ Deberías ver 8 atletas instantáneamente

### Test 2: Búsqueda
1. Escribe "Juan" en el campo de búsqueda
2. Click en "Buscar"
✅ Deberías ver solo "Juan Carlos Pérez"

### Test 3: Filtros
1. Click en "Inactivos"
✅ Deberías ver solo atletas con badge rojo

### Test 4: Eliminar
1. Click en el ícono de basura 🗑️
2. Confirmar
✅ El atleta desaparece de la lista

---

## 🐛 Solución de problemas

### Problema: No aparece en el sidebar
**Solución**: Recarga la página con `Cmd+R` (Mac) o `Ctrl+R` (Windows)

### Problema: "No se encontraron atletas"
**Solución**: 
1. Activar modo mock: `USE_MOCK_DATA = true`
2. Verificar que el backend esté corriendo
3. Revisar la consola del navegador (F12)

### Problema: Error 404 al hacer click
**Solución**: Verifica que el archivo exista en:
`/src/app/(admin)/(others-pages)/atletas/page.tsx`

### Problema: Estilos rotos
**Solución**: 
```bash
# Reinstalar dependencias
npm install
# o
pnpm install
```

---

## 📚 Documentación adicional

1. **`README_ATHLETES.md`** - Resumen ejecutivo
2. **`GETTING_STARTED_ATHLETES.md`** - Guía completa de uso
3. **`FRONTEND_ATHLETES.md`** - Documentación del frontend
4. **`BACKEND_IMPLEMENTATION.md`** - Guía del backend NestJS

---

## 🎉 ¡Todo listo para usar!

### Quick checklist:
- [x] ✅ Página creada en `/atletas`
- [x] ✅ Menú del sidebar actualizado
- [x] ✅ Datos mock disponibles
- [x] ✅ Tabla funcional con filtros
- [x] ✅ Paginación implementada
- [x] ✅ Dark mode soportado
- [x] ✅ Responsive design
- [x] ✅ Documentación completa

### Próximo paso sugerido:
1. **Prueba con datos mock** (2 minutos)
2. **Implementa el backend** (30 minutos)
3. **Crea la página de detalles** `/atletas/[id]`

---

## 💡 Tips

- **Desarrollo rápido**: Usa `USE_MOCK_DATA = true` mientras desarrollas
- **Debug**: Abre DevTools (F12) → Network para ver las peticiones
- **Hot reload**: Next.js recarga automáticamente al guardar cambios
- **Dark mode**: Click en el botón de tema en el header

---

## 📞 Comandos útiles

```bash
# Iniciar desarrollo
npm run dev

# Build de producción
npm run build

# Linter
npm run lint

# Ver en navegador
open http://localhost:3000/atletas
```

---

**¿Preguntas?** 
- Revisa `GETTING_STARTED_ATHLETES.md` para detalles
- Consulta `BACKEND_IMPLEMENTATION.md` para el backend
- Abre un issue en GitHub si encuentras bugs

**¡Disfruta tu nueva vista de atletas! 🏃‍♂️💪**
