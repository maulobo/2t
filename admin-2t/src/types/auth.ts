export type UserRole = 'ADMIN' | 'ATHLETE' | 'COACH';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  phone?: string;
  athleteId?: string; // Si es ATHLETE, referencia al Athlete
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCoachData {
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterAthleteData {
  email: string;
  password: string;
  phone?: string;
  fullName: string;
  birthDate: string;
}

export interface AuthResponse {
  user: AuthUser;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
