/**
 * Centralized Fetch & Axios-compatible API Client
 * Configured for Vercel Next.js / React frontend and Django REST Framework backend
 */

export const TOKEN_KEY = 'kaizen_auth_token';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Get configured API Base URL
 * Prefers NEXT_PUBLIC_API_BASE_URL for Vercel Next.js environments
 * then VITE_API_BASE_URL for Vite, falling back to relative '' for same-domain Cloud Run proxy.
 */
export const getApiBaseUrl = (): string => {
  let url = '';
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE_URL) {
    url = process.env.NEXT_PUBLIC_API_BASE_URL;
  } else if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL) {
    url = (import.meta as any).env.VITE_API_BASE_URL;
  }
  return url.replace(/\/+$/, ''); // Strip trailing slashes
};

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class DjangoApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'DjangoApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Robust fetch wrapper with Bearer token injection, CORS credentials,
 * and Django REST Framework global error handling
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let fullUrl = `${baseUrl}${cleanEndpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Handles CORS cookie sessions
  };

  try {
    const response = await fetch(fullUrl, fetchOptions);

    let data: any = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => '');
      data = text ? { message: text } : {};
    }

    // Handle global DRF error codes
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized token refresh or expired session
        removeStoredToken();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.warn('[DRF Auth] Token expired or invalid 401. Session cleared.');
        }
      }

      // Format DRF validation error message payloads cleanly
      let errorMessage = 'An error occurred while communicating with the server.';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.non_field_errors) {
        errorMessage = Array.isArray(data.non_field_errors)
          ? data.non_field_errors.join(', ')
          : String(data.non_field_errors);
      } else if (typeof data === 'object' && Object.keys(data).length > 0) {
        const fieldErrors = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        if (fieldErrors) errorMessage = fieldErrors;
      }

      throw new DjangoApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof DjangoApiError) {
      throw error;
    }
    throw new DjangoApiError(
      error.message || 'Network connection error. Please check your connection.',
      500
    );
  }
}
