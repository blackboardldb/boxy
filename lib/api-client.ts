/**
 * Cliente centralizado para fetching de datos en el cliente (TanStack Query).
 * 
 * NOTA CRÍTICA (Fase 1 HAL-10):
 * Este cliente NO inyecta `cache: 'no-store'` de manera global.
 * Permitimos que TanStack Query maneje el ciclo de vida (stale/refetch)
 * a través de sus mecanismos, evitando duplicar el problema de desactivación de caché a nivel HTTP.
 */

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    // errorData.error puede ser un string o un objeto {message, code, ...}
    const errorMsg =
      typeof errorData?.error === "string"
        ? errorData.error
        : errorData?.error?.message ??
          errorData?.message ??
          "Error en la petición a la API";

    throw new ApiError(errorMsg, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
