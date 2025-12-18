import axios from 'axios';

// Crear instancia de Axios configurada para httpOnly cookies
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // ← CRUCIAL: Envía cookies automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs de desarrollo
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[Axios] Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`[Axios] Response ${response.status} from ${response.config.url}`);
      console.log('[Axios] Response data:', response.data);
      return response;
    },
    (error) => {
      // No loguear errores 401 porque son esperados cuando no hay sesión
      // El middleware se encarga de redirigir al login
      if (error.response?.status !== 401) {
        console.error('[Axios] Response error:', error.response?.status, error.message);
        console.error('[Axios] Error details:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          fullURL: error.config?.baseURL && error.config?.url 
            ? `${error.config.baseURL}${error.config.url}` 
            : 'URL not available',
        });
      }
      return Promise.reject(error);
    }
  );
}

export default api;
