import { Athlete } from "@/types/athlete";

// Datos de ejemplo para testing sin backend
export const mockAthletes: Athlete[] = [
  {
    id: "athlete-1",
    userId: "user-1",
    fullName: "Juan Carlos Pérez",
    birthDate: "1995-03-15T00:00:00.000Z",
    notes: "Principiante en CrossFit. Objetivo: mejorar resistencia.",
    active: true,
    coachId: "coach-1",
    user: {
      email: "juan.perez@example.com",
      phone: "+5491112345678",
    },
    payments: [
      {
        id: "payment-1",
        athleteId: "athlete-1",
        amount: 8000000,
        periodStart: "2025-10-01T00:00:00.000Z",
        periodEnd: "2025-10-31T00:00:00.000Z",
        status: "APPROVED",
        createdAt: "2025-10-01T10:00:00.000Z",
        approvedAt: "2025-10-02T09:00:00.000Z",
        evidenceUrl: null,
        evidenceText: "Pago octubre 2025 - Transferencia",
      },
    ],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 1,
      assignments: 12,
    },
  },
  {
    id: "athlete-2",
    userId: "user-2",
    fullName: "María Fernanda González",
    birthDate: "1992-08-22T00:00:00.000Z",
    notes: "Nivel avanzado. Compite en torneos locales.",
    active: true,
    coachId: "coach-1",
    user: {
      email: "maria.gonzalez@example.com",
      phone: "+5491198765432",
    },
    payments: [
      {
        id: "payment-2",
        athleteId: "athlete-2",
        amount: 8000000,
        periodStart: "2025-10-01T00:00:00.000Z",
        periodEnd: "2025-10-31T00:00:00.000Z",
        status: "APPROVED",
        createdAt: "2025-10-01T10:00:00.000Z",
        approvedAt: "2025-10-02T09:00:00.000Z",
        evidenceUrl: null,
        evidenceText: "Pago octubre 2025 - Efectivo",
      },
    ],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 1,
      assignments: 24,
    },
  },
  {
    id: "athlete-3",
    userId: "user-3",
    fullName: "Roberto Martínez",
    birthDate: "1988-12-05T00:00:00.000Z",
    notes: "Recuperándose de lesión en rodilla.",
    active: false,
    coachId: "coach-1",
    user: {
      email: "roberto.martinez@example.com",
      phone: "+5491156781234",
    },
    payments: [],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 0,
      assignments: 8,
    },
  },
  {
    id: "athlete-4",
    userId: "user-4",
    fullName: "Laura Beatriz Sánchez",
    birthDate: "1998-06-18T00:00:00.000Z",
    notes: "Especializada en weightlifting.",
    active: true,
    coachId: "coach-1",
    user: {
      email: "laura.sanchez@example.com",
      phone: "+5491143218765",
    },
    payments: [
      {
        id: "payment-3",
        athleteId: "athlete-4",
        amount: 8000000,
        periodStart: "2025-10-01T00:00:00.000Z",
        periodEnd: "2025-10-31T00:00:00.000Z",
        status: "PENDING",
        createdAt: "2025-10-01T10:00:00.000Z",
        approvedAt: null,
        evidenceUrl: null,
        evidenceText: "Pago octubre 2025 - Pendiente",
      },
    ],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 1,
      assignments: 18,
    },
  },
  {
    id: "athlete-5",
    userId: "user-5",
    fullName: "Diego Alejandro Rodríguez",
    birthDate: "1990-01-30T00:00:00.000Z",
    notes: "Preparación para Iron Man.",
    active: true,
    coachId: "coach-1",
    user: {
      email: "diego.rodriguez@example.com",
      phone: null,
    },
    payments: [],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 0,
      assignments: 30,
    },
  },
  {
    id: "athlete-6",
    userId: "user-6",
    fullName: "Carolina López",
    birthDate: "1994-09-12T00:00:00.000Z",
    notes: "Nuevo en el gimnasio. Inducción pendiente.",
    active: true,
    coachId: "coach-1",
    user: {
      email: "carolina.lopez@example.com",
      phone: "+5491187654321",
    },
    payments: [],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 0,
      assignments: 2,
    },
  },
  {
    id: "athlete-7",
    userId: "user-7",
    fullName: "Martín Fernández",
    birthDate: "1985-04-25T00:00:00.000Z",
    notes: "Atleta veterano. Excelente técnica.",
    active: true,
    coachId: "coach-1",
    user: {
      email: "martin.fernandez@example.com",
      phone: "+5491134567890",
    },
    payments: [],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 0,
      assignments: 45,
    },
  },
  {
    id: "athlete-8",
    userId: "user-8",
    fullName: "Valeria Romero",
    birthDate: "1993-11-08T00:00:00.000Z",
    notes: "Suspendida temporalmente por viaje.",
    active: false,
    coachId: "coach-1",
    user: {
      email: "valeria.romero@example.com",
      phone: "+5491145678901",
    },
    payments: [],
    coach: {
      user: {
        email: "coach@example.com",
      },
    },
    _count: {
      payments: 4,
      assignments: 10,
    },
  },
];

// Mock de respuesta del API
export const mockAthletesResponse = {
  athletes: mockAthletes,
  total: mockAthletes.length,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};
