/**
 * Estado de pago
 */
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Interfaz para Activity (Catálogo de actividades del box)
 */
export interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  color: string;
  icon?: string; // Opcional - no se usa más en el frontend
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    athleteActivities: number;
    payments: number;
    trainings: number;
  };
}

/**
 * Interfaz para AthleteActivity (Relación atleta-actividad)
 */
export interface AthleteActivity {
  id: string;
  athleteId: string;
  activityId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  activity?: Activity;
  athlete?: Athlete;
}

/**
 * Interfaz para Payment (Actualizado con activityId)
 */
export interface Payment {
  id: string;
  athleteId: string;
  activityId: string | null; // NUEVO: Qué actividad está pagando
  amount: number; // Pesos directos (15000, no 1500000)
  periodStart: string;
  periodEnd: string;
  status: PaymentStatus;
  createdAt: string;
  approvedAt: string | null;
  evidenceUrl: string | null;
  evidenceText: string | null;
  // Campos para pagos por cantidad/unidad
  quantity?: number | null;
  pricePerUnit?: number | null;
  activityType?: string | null; // Deprecated - usar activityId
  activity?: Activity;
  athlete?: Athlete;
}

/**
 * Interfaz para AthleteMetric (métricas corporales y rendimiento)
 */
export interface AthleteMetric {
  id: string;
  athleteId: string;
  date: string; // DateTime -> string in JSON
  
  // Métricas corporales
  weight: number | null; // Peso en kg
  bodyFatPercent: number | null; // % de grasa corporal
  muscleMass: number | null; // Masa muscular en kg
  bmi: number | null; // IMC
  
  // Perímetros en cm
  waist: number | null; // Cintura
  hip: number | null; // Cadera
  chest: number | null; // Pecho
  rightArm: number | null; // Brazo derecho
  leftArm: number | null; // Brazo izquierdo
  rightThigh: number | null; // Muslo derecho
  leftThigh: number | null; // Muslo izquierdo
  
  // Levantamientos - 1RM (One Rep Max) en kg
  backSquat: number | null; // Sentadilla trasera
  frontSquat: number | null; // Sentadilla frontal
  deadlift: number | null; // Peso muerto
  benchPress: number | null; // Press de banca
  shoulderPress: number | null; // Press militar
  cleanAndJerk: number | null; // Cargada y envión
  snatch: number | null; // Arrancada
  
  // Benchmark WODs (tiempos en segundos o reps)
  franTime: number | null; // Fran en segundos
  murphTime: number | null; // Murph en segundos
  cindyRounds: number | null; // Cindy - rounds en 20min
  graceTime: number | null; // Grace en segundos
  helenTime: number | null; // Helen en segundos
  
  // Otros
  maxPullUps: number | null; // Pull-ups consecutivos
  maxPushUps: number | null; // Push-ups consecutivos
  plankTime: number | null; // Plancha en segundos
  
  // Metricas personalizadas (JSON dinamico)
  customMetrics: Record<string, number> | null; // Cualquier metrica adicional
  
  notes: string | null; // Notas adicionales
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfaz para WOD según schema Prisma
 * @deprecated Usar Training en su lugar
 */
export interface WOD {
  id: string;
  title: string;
  description: string;
  date: string; // DateTime -> string in JSON
  track: string | null;
  createdById: string;
  
  // CreatedBy relation (User)
  createdBy?: {
    id: string;
    email: string;
    role: 'COACH';
  };
}

/**
 * Interfaz para Training (Renombrado de WOD)
 */
export interface Training {
  id: string;
  title: string;
  description: string;
  date: string;
  videoUrl: string | null; // URL de YouTube/Vimeo
  activityId: string | null; // A qué actividad pertenece
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Relaciones
  activity?: Activity;
  createdBy?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'COACH';
  };
}

/**
 * Interfaz para Assignment (WODAssignment en schema Prisma)
 */
export interface Assignment {
  id: string;
  wodId: string;
  athleteId: string;
  
  // WOD relation (sin assignments para evitar referencia circular)
  wod: {
    id: string;
    title: string;
    description: string;
    date: string;
    track: string | null;
    createdById: string;
  };
}

/**
 * DTO para crear una nueva actividad de atleta
 */
export interface CreateAthleteActivityDto {
  athleteId: string;
  activityType: string;
  startDate?: string;
  notes?: string;
}

/**
 * DTO para actualizar notas de actividad
 */
export interface UpdateAthleteActivityNotesDto {
  notes: string;
}

/**
 * Estadísticas de actividades
 */
export interface ActivityStats {
  activityType: string;
  count: number;
  activeCount: number;
}

/**
 * Interfaz para Athlete según schema Prisma (AthleteProfile + User)
 */
export interface Athlete {
  // AthleteProfile fields
  id: string;
  userId: string;
  fullName: string;
  birthDate: string | null; // DateTime -> string in JSON
  notes: string | null;
  active: boolean;
  coachId: string | null;
  activityType?: string | null; // DEPRECATED: Usar activities en su lugar
  
  // Datos personales adicionales
  height: number | null; // Altura en cm
  gender: string | null; // "MALE", "FEMALE", "OTHER"
  bloodType: string | null; // "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  city: string | null;
  province: string | null;
  country: string | null;
  
  // Contacto de emergencia
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;

  // Objetivos y salud
  goals: string | null; // Objetivos personales
  injuries: string | null; // Historial de lesiones
  medications: string | null; // Medicaciones actuales
  
  // User relation
  user: {
    id: string;
    email: string;
    phone: string | null;
    role: 'ATHLETE';
    createdAt: string;
    updatedAt: string;
  };
  
  // Coach relation (optional)
  coach?: {
    id: string;
    email: string;
    role: 'COACH';
  };
  
  // Relations
  payments: Payment[];
  assignments?: Assignment[]; // WODAssignment en el schema
  activities?: AthleteActivity[]; // Actividades del atleta (múltiples)
  metrics?: AthleteMetric[]; // Métricas del atleta
  
  // Count aggregations (optional)
  _count?: {
    payments: number;
    assignments: number;
    activities?: number;
    metrics?: number;
  };
}

/**
 * Parámetros para listar atletas
 */
export interface AthleteListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  coachId?: string;
  include?: string; // Para incluir relaciones (ej: 'activities,payments')
}

/**
 * Respuesta de la lista de atletas
 */
export interface AthleteListResponse {
  athletes: Athlete[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * DTO para crear un atleta (según schema Prisma)
 */
export interface CreateAthleteDto {
  // Datos del User
  email: string;
  password: string;
  phone?: string;
  // Datos del AthleteProfile
  fullName: string;
  birthDate?: string; // DateTime en Prisma
  notes?: string;
  coachId?: string; // Opcional en el schema
  activityType?: string; // Tipo de actividad
}

/**
 * DTO para actualizar un atleta
 * Nota: phone pertenece a User, no a AthleteProfile
 */
export interface UpdateAthleteDto {
  fullName?: string;
  birthDate?: string;
  notes?: string;
  active?: boolean;
  activityType?: string; // Tipo de actividad (DEPRECATED)
  
  // Datos personales adicionales
  height?: number; // Altura en cm
  gender?: string; // "MALE", "FEMALE", "OTHER"
  bloodType?: string; // "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  city?: string;
  province?: string;
  country?: string;
  
  // Contacto de emergencia
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Objetivos y salud
  goals?: string; // Objetivos personales
  injuries?: string; // Historial de lesiones
  medications?: string; // Medicaciones actuales
}

/**
 * DTO para crear una métrica de atleta
 */
export interface CreateAthleteMetricDto {
  athleteId: string;
  date?: string; // Fecha de la medición
  
  // Métricas corporales
  weight?: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  bmi?: number;
  
  // Perímetros en cm
  waist?: number;
  hip?: number;
  chest?: number;
  rightArm?: number;
  leftArm?: number;
  rightThigh?: number;
  leftThigh?: number;
  
  // Levantamientos - 1RM en kg
  backSquat?: number;
  frontSquat?: number;
  deadlift?: number;
  benchPress?: number;
  shoulderPress?: number;
  cleanAndJerk?: number;
  snatch?: number;
  
  // Benchmark WODs
  franTime?: number;
  murphTime?: number;
  cindyRounds?: number;
  graceTime?: number;
  helenTime?: number;
  
  // Otros
  maxPullUps?: number;
  maxPushUps?: number;
  plankTime?: number;
  
  // Metricas personalizadas
  customMetrics?: Record<string, number>;
  
  notes?: string;
}

/**
 * DTO para actualizar una métrica
 */
export type UpdateAthleteMetricDto = Partial<Omit<CreateAthleteMetricDto, 'athleteId'>>;

/**
 * Respuesta de progreso de peso
 */
export interface WeightProgressResponse {
  athleteId: string;
  athleteName: string;
  data: Array<{
    date: string;
    weight: number;
    bmi?: number;
    bodyFatPercent?: number;
  }>;
}

/**
 * Respuesta de récords personales
 */
export interface PersonalRecordsResponse {
  athleteId: string;
  athleteName: string;
  records: {
    backSquat?: { value: number; date: string };
    frontSquat?: { value: number; date: string };
    deadlift?: { value: number; date: string };
    benchPress?: { value: number; date: string };
    shoulderPress?: { value: number; date: string };
    cleanAndJerk?: { value: number; date: string };
    snatch?: { value: number; date: string };
  };
}

/**
 * Respuesta de récords de benchmarks
 */
export interface BenchmarkRecordsResponse {
  athleteId: string;
  athleteName: string;
  benchmarks: {
    fran?: { time: number; date: string };
    murph?: { time: number; date: string };
    cindy?: { rounds: number; date: string };
    grace?: { time: number; date: string };
    helen?: { time: number; date: string };
  };
}

/**
 * Interfaz para Forum Post
 */
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  author?: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear un post del foro
 */
export interface CreateForumPostDto {
  title: string;
  content: string;
  published?: boolean;
}

/**
 * DTO para actualizar un post del foro
 */
export interface UpdateForumPostDto {
  title?: string;
  content?: string;
  published?: boolean;
}
