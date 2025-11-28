const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Transform MongoDB _id to id for frontend compatibility
function transformResponse(data: any): any {
  if (Array.isArray(data)) {
    return data.map(transformResponse);
  }
  if (data && typeof data === 'object' && data._id) {
    const { _id, ...rest } = data;
    return { id: _id, ...transformResponse(rest) };
  }
  if (data && typeof data === 'object') {
    const transformed: any = {};
    for (const key in data) {
      transformed[key] = transformResponse(data[key]);
    }
    return transformed;
  }
  return data;
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || 'An error occurred'
    );
  }

  const data = await response.json();
  return transformResponse(data);
}

export async function apiGet<T>(path: string): Promise<T> {
  return fetchApi<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return fetchApi<T>(path, { method: 'DELETE' });
}
