import { useEffect, useState } from 'react';
import { athletesApi } from '@/lib/api';

/**
 * Hook para obtener el athleteId desde el userId del auth context
 * Útil porque el sistema tiene dos IDs:
 * - userId: ID en la tabla users (auth)
 * - athleteId: ID en la tabla athletes (datos del atleta)
 */
export const useAthleteId = (userId: string | undefined) => {
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAthleteId = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const athlete = await athletesApi.getByUserId(userId);
        setAthleteId(athlete.id);
      } catch (err) {
        console.error('[useAthleteId] Error fetching athlete:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteId();
  }, [userId]);

  return { athleteId, loading, error };
};
