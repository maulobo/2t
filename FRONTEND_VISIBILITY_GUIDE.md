# 👁️ Guía de Visibilidad y Filtrado de Actividades

Esta guía explica cómo el backend gestiona la visibilidad de los entrenamientos (WODs) basándose en los pagos y actividades activas de cada atleta.

## 🧠 Concepto Principal: "Pay to View"

El sistema implementa una lógica de **filtrado automático** en el backend.

- Un **Atleta** solo puede ver los entrenamientos asociados a las **Actividades** que tiene **Activas**.
- Una actividad se considera "Activa" si el atleta tiene una suscripción vigente (generalmente activada mediante un Pago Aprobado).
- **Lógica Aditiva**: Si un atleta paga por una nueva actividad, esta se **suma** a sus actividades actuales. No reemplaza las anteriores.

---

## 🔄 Flujo de Pagos y Activación

1. **Creación del Pago**:

   - El atleta (o admin) crea un pago indicando la `activityId` (ej: ID de "CrossFit").
   - Estado inicial: `PENDING`.

2. **Aprobación del Pago**:
   - Cuando un Admin/Coach aprueba el pago (`PATCH /payments/:id/approve`):
     - El sistema busca si el atleta ya tiene esa actividad.
     - **Si ya la tiene**: Extiende la fecha de vencimiento (`endDate`).
     - **Si no la tiene**: Crea una nueva relación `AthleteActivity` y la marca como `isActive: true`.
     - **Importante**: Las otras actividades activas del atleta permanecen intactas.

---

## 📅 Endpoints de Entrenamientos (Filtrado Automático)

El frontend **NO** necesita enviar filtros adicionales para ocultar entrenamientos no permitidos. El backend lo hace automáticamente basándose en el token de autenticación del usuario.

### Endpoints Afectados

Todos los endpoints de lectura de entrenamientos aplican este filtro si el usuario es `ROLE: ATHLETE`.

| Endpoint                         | Descripción           | Comportamiento para Atleta                   |
| -------------------------------- | --------------------- | -------------------------------------------- |
| `GET /trainings/today`           | Entrenamientos de hoy | Solo devuelve clases de actividades pagadas. |
| `GET /trainings/date`            | Por fecha específica  | Solo devuelve clases de actividades pagadas. |
| `GET /trainings/month`           | Calendario mensual    | Solo devuelve clases de actividades pagadas. |
| `GET /trainings/upcoming/future` | Próximas clases       | Solo devuelve clases de actividades pagadas. |
| `GET /trainings`                 | Listado general       | Solo devuelve clases de actividades pagadas. |

### Ejemplo de Respuesta

Si un atleta paga solo por **"Yoga"**, al llamar a `GET /trainings/today`:

**Respuesta:**

```json
{
  "date": "2025-12-16",
  "trainings": [
    {
      "id": "...",
      "title": "Clase de Yoga Avanzado",
      "activity": { "name": "Yoga" }
    }
    // NO verá la "Clase de CrossFit" aunque exista en la base de datos para hoy.
  ]
}
```

---

## 🛠️ Implementación en Frontend

1. **Autenticación**: Asegúrate de que las peticiones incluyan la cookie `access_token` (o el header Authorization si se cambia la estrategia). El backend necesita identificar al usuario para filtrar.
2. **Sin Lógica Extra**: No necesitas filtrar arrays en el cliente. Confía en que la API devuelve solo lo que el usuario puede ver.
3. **Feedback Visual**:
   - Si el atleta no tiene actividades activas, los endpoints devolverán arrays vacíos `[]`.
   - Puedes mostrar un mensaje tipo: _"No tienes actividades activas. Realiza un pago para ver los entrenamientos."_

## 🧪 Casos de Prueba para QA/Dev

1. **Usuario Nuevo**:
   - Crea usuario -> Login.
   - `GET /trainings/today` -> Debe estar vacío (0 actividades).
2. **Pago Actividad A**:
   - Pagar "CrossFit" -> Aprobar.
   - `GET /trainings/today` -> Debe mostrar solo clases de CrossFit.
3. **Pago Actividad B (Aditivo)**:
   - Pagar "Yoga" -> Aprobar.
   - `GET /trainings/today` -> Debe mostrar clases de CrossFit **Y** Yoga.
