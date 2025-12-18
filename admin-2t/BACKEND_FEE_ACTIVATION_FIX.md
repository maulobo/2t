# 🐛 Bug: Las cuotas se pisan entre diferentes tipos de actividad

## Problema Actual

Cuando se activa una cuota de un tipo de actividad (ej: Open Box), se están desactivando las cuotas de **todos** los tipos de actividad, incluyendo CrossFit, Personalizado A, etc.

**Comportamiento actual (incorrecto):**
```
1. Tengo cuota activa de CrossFit
2. Activo cuota de Open Box
3. ❌ La cuota de CrossFit se desactiva
```

**Comportamiento esperado (correcto):**
```
1. Tengo cuota activa de CrossFit
2. Activo cuota de Open Box
3. ✅ La cuota de CrossFit sigue activa
4. ✅ La cuota de Open Box está activa
5. ✅ Cada actividad tiene su propia cuota independiente
```

---

## Solución Requerida en Backend

### Endpoint afectado:
```
PATCH /fees/:feeId/activate
```

### Cambio necesario:

Cuando se activa una cuota, el backend debe:

1. **Obtener el `activityType` de la cuota que se está activando**
2. **Desactivar SOLO las cuotas del mismo `activityType`**
3. **NO tocar las cuotas de otros tipos de actividad**

### Ejemplo de código Prisma (lógica correcta):

```typescript
// ❌ INCORRECTO (código actual - deshabilita todas)
await prisma.feeSettings.updateMany({
  where: { isActive: true },
  data: { isActive: false }
});

// ✅ CORRECTO (solo deshabilita del mismo tipo)
const feeToActivate = await prisma.feeSettings.findUnique({
  where: { id: feeId }
});

// Desactivar solo cuotas del mismo tipo de actividad
await prisma.feeSettings.updateMany({
  where: {
    isActive: true,
    activityType: feeToActivate.activityType  // ← CLAVE: Mismo tipo
  },
  data: { isActive: false }
});

// Activar la nueva
await prisma.feeSettings.update({
  where: { id: feeId },
  data: { isActive: true }
});
```

---

## Casos de Uso

### Caso 1: Múltiples actividades con cuotas diferentes
```
- CrossFit: $60,000/mes (activa)
- Open Box: $45,000/mes (activa)
- Personalizado A: $80,000/mes (activa)
- Funcional: $50,000/mes (activa)
```

Todas pueden estar activas al mismo tiempo porque son diferentes tipos de actividad.

### Caso 2: Actualizar cuota de una actividad específica
```
Estado inicial:
- CrossFit: $60,000 (activa)
- Open Box: $45,000 (activa)

Activo nueva cuota de CrossFit de $65,000:

Estado final:
- CrossFit: $60,000 (inactiva)  ← Solo esta se desactiva
- CrossFit: $65,000 (activa)    ← Nueva activa
- Open Box: $45,000 (activa)    ← NO SE TOCA
```

---

## Validación

Después de implementar el fix, verificar:

1. ✅ Crear cuota de CrossFit y activarla
2. ✅ Crear cuota de Open Box y activarla
3. ✅ Verificar que ambas estén activas simultáneamente
4. ✅ Crear nueva cuota de CrossFit y activarla
5. ✅ Verificar que solo se desactivó la cuota anterior de CrossFit
6. ✅ Verificar que la cuota de Open Box sigue activa

---

## Impacto

Este bug afecta:
- ❌ Formulario de pagos: No puede distinguir entre cuotas de diferentes actividades
- ❌ Atletas: No pueden tener la cuota correcta según su tipo de actividad
- ❌ Gestión de cuotas: Administradores no pueden mantener múltiples cuotas activas

---

## Prioridad: 🔴 ALTA

Sin este fix, el sistema de cuotas por actividad no funciona correctamente.
