/**
 * SDK específico para el módulo de Atletas
 */

import { apiClient } from './client';
import { 
  Athlete, 
  AthleteListParams,
  AthleteListResponse,
  CreateAthleteDto,
  UpdateAthleteDto
} from '@/types/athlete';

/**
 * Cliente API para el módulo de Atletas
 */
export const athletesApi = {
  /**
   * Obtener lista de atletas con paginación y filtros
   * USO: Server Component (con caché) o Client Component
   * 
   * NOTA: El backend actualmente devuelve un array directamente.
   * Transformamos la respuesta para que coincida con la interfaz esperada.
   */
  async getAll(params: AthleteListParams = {}): Promise<AthleteListResponse> {
    const queryString = apiClient.buildQueryString(params);
    
    // El backend devuelve Athlete[] directamente
    const athletes = await apiClient.get<Athlete[]>(
      `/athletes${queryString}`,
      {
        // Server Components: caché automático por 60 segundos
        revalidate: 60,
      }
    );


    // Transformar la respuesta para incluir metadata de paginación
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = athletes.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      athletes,
      total,
      page,
      pageSize,
      totalPages,
    };
 },
 


  /**
   * Obtener un atleta por ID
   * USO: Server Component (para SSR) o Client Component
   */
  async getById(id: string): Promise<Athlete> {
    return apiClient.get<Athlete>(`/athletes/${id}`, {
      revalidate: 30,
    });
  },

  /**
   * Obtener un atleta por userId (ID del usuario asociado)
   * USO: Client Component
   */
  async getByUserId(userId: string): Promise<Athlete> {
    const athletes = await apiClient.get<Athlete[]>(`/athletes`, {
      revalidate: 30,
    });
    
    const athlete = athletes.find(a => a.userId === userId);
    if (!athlete) {
      throw new Error(`No se encontró atleta con userId: ${userId}`);
    }
    
    return athlete;
  },

  /**
   * Crear un nuevo atleta
   * USO: Client Component o Server Action
   */
  async create(data: CreateAthleteDto): Promise<Athlete> {
    return apiClient.post<Athlete>('/athletes', data);
  },

  /**
   * Actualizar un atleta
   * USO: Client Component o Server Action
   */
  async update(id: string, data: UpdateAthleteDto): Promise<Athlete> {
    return apiClient.patch<Athlete>(`/athletes/${id}`, data);
  },

  /**
   * Eliminar un atleta
   * USO: Client Component o Server Action
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/athletes/${id}`);
  },

  /**
   * Activar/Desactivar un atleta
   * USO: Client Component o Server Action
   */
  async toggleActive(id: string, active: boolean): Promise<Athlete> {
    return apiClient.patch<Athlete>(`/athletes/${id}`, { active });
  },

  /**
   * Obtener atletas de un coach específico
   * USO: Server Component o Client Component
   */
  async getByCoach(coachId: string, params: Omit<AthleteListParams, 'coachId'> = {}): Promise<AthleteListResponse> {
    const queryString = apiClient.buildQueryString({ ...params, coachId });
    
    // El backend devuelve Athlete[] directamente
    const athletes = await apiClient.get<Athlete[]>(
      `/athletes${queryString}`,
      {
        revalidate: 60,
      }
    );

    // Transformar la respuesta
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = athletes.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      athletes,
      total,
      page,
      pageSize,
      totalPages,
    };
  },
};
