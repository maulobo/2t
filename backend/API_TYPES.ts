/**
 * API Types - Frontend TypeScript Definitions
 * Copiar estos tipos en tu proyecto de frontend
 */

// ============================================
// ENUMS
// ============================================

export enum Role {
  COACH = 'COACH',
  ATHLETE = 'ATHLETE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ============================================
// MODELS
// ============================================

export interface User {
  id: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  fullName: string;
  birthDate?: string;
  notes?: string;
  active: boolean;
  coachId: string;
}

export interface Payment {
  id: string;
  athleteId: string;
  amount: number; // en centavos
  periodStart: string;
  periodEnd: string;
  status: PaymentStatus;
  createdAt: string;
  approvedAt?: string;
  evidenceUrl?: string;
  evidenceText?: string;
}

export interface WOD {
  id: string;
  title: string;
  description: string;
  date: string;
  track?: string;
  createdById: string;
}

export interface WODAssignment {
  id: string;
  wodId: string;
  athleteId: string;
}

// ============================================
// API RESPONSES (con relaciones)
// ============================================

export interface CoachResponse extends User {
  coach: CoachProfile;
}

export interface AthleteResponse extends User {
  athlete: AthleteProfile;
}

export interface AthleteWithDetails extends AthleteProfile {
  user: {
    email: string;
    phone?: string;
  };
  payments: Payment[];
  assignments?: Array<{
    id: string;
    wod: WOD;
  }>;
}

export interface PaymentWithAthlete extends Payment {
  athlete: {
    id: string;
    fullName: string;
    user: {
      email: string;
      phone?: string;
    };
  };
}

export interface PaymentStatusResponse {
  isPaid: boolean;
  payment: Payment | null;
}

// ============================================
// REQUEST BODIES
// ============================================

export interface CreateCoachRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface CreateAthleteRequest {
  email: string;
  password: string;
  phone?: string;
  fullName: string;
  birthDate?: string; // ISO date string
  coachId: string;
  notes?: string;
}

export interface UpdateAthleteRequest {
  fullName?: string;
  birthDate?: string;
  notes?: string;
  active?: boolean;
}

export interface CreatePaymentRequest {
  athleteId: string;
  amount: number; // en pesos (se convierte a centavos automáticamente)
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  evidenceUrl?: string;
  evidenceText?: string;
}

export interface UpdateEvidenceRequest {
  evidenceUrl: string;
  evidenceText?: string;
}

// ============================================
// API ERROR
// ============================================

export interface APIError {
  statusCode: number;
  message: string;
  error?: string;
}

// ============================================
// HELPER TYPES
// ============================================

export type AthleteId = string; // ID del AthleteProfile
export type UserId = string; // ID del User
export type CoachId = string;
export type PaymentId = string;
export type WODId = string;
