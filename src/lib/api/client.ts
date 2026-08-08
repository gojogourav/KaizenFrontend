import { getAccessToken, setAccessToken } from './token_store';

const isBrowser = typeof window !== 'undefined';
const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);
const REFRESH_ENDPOINT = '/api/token/refresh/';
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 1;

function getCookie(name: string): string | null {
  if (!isBrowser || !document.cookie) return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export const getApiBaseUrl = (): string => {
  let url = '';

  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    url = process.env.NEXT_PUBLIC_API_BASE_URL;
  } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
    url = (import.meta as any).env.VITE_API_BASE_URL;
  }

  const isProd =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD);

  if (!url && isProd) {
    throw new Error('API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL or VITE_API_BASE_URL.');
  }

  return url.replace(/\/+$/, '');
};

export class DjangoApiError extends Error {
  status: number;
  data: unknown;
  isTimeout: boolean;

  constructor(message: string, status: number, data?: unknown, isTimeout = false) {
    super(message);
    this.name = 'DjangoApiError';
    this.status = status;
    this.data = data;
    this.isTimeout = isTimeout;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: RequestInit['body'];
  timeoutMs?: number;
  retries?: number;
  onSessionExpired?: () => void;
  _isRetry?: boolean;
}

function buildUrl(base: string, endpoint: string, params?: ApiRequestOptions['params']): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${base}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  return url;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorMessage(data: unknown): string {
  if (typeof data === 'string') return data;

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string') return d.detail;
    if (typeof d.error === 'string') return d.error;
    if (d.non_field_errors) {
      return Array.isArray(d.non_field_errors) ? d.non_field_errors.join(', ') : String(d.non_field_errors);
    }
    const entries = Object.entries(d);
    if (entries.length > 0) {
      const fieldErrors = entries
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join(' | ');
      if (fieldErrors) return fieldErrors;
    }
  }

  return 'An error occurred while communicating with the server.';
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const csrfToken = getCookie('csrftoken');

        const response = await fetch(buildUrl(baseUrl, REFRESH_ENDPOINT), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
          },
        });

        if (!response.ok) {
          setAccessToken(null);
          return null;
        }

        const data = await response.json().catch(() => ({}));
        const newToken: string | undefined = data.access;
        setAccessToken(newToken ?? null);
        return newToken ?? null;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiClient<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    params,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    onSessionExpired,
    headers: callerHeaders,
    method = 'GET',
    _isRetry = false,
    ...rest
  } = options;

  const baseUrl = getApiBaseUrl();
  const fullUrl = buildUrl(baseUrl, endpoint, params);
  const httpMethod = method.toUpperCase();
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(callerHeaders as Record<string, string>),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  if (!CSRF_SAFE_METHODS.has(httpMethod)) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
  }

  const maxAttempts = httpMethod === 'GET' ? Math.max(1, retries + 1) : 1;
  let lastError: DjangoApiError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        ...rest,
        method: httpMethod,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timer);

      let data: unknown = {};
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json().catch(() => ({}));
      } else {
        const text = await response.text().catch(() => '');
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        if (response.status === 401 && !_isRetry && !endpoint.startsWith(REFRESH_ENDPOINT)) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            return apiClient<T>(endpoint, { ...options, _isRetry: true });
          }
          onSessionExpired?.();
        }

        throw new DjangoApiError(extractErrorMessage(data), response.status, data);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timer);

      if (error instanceof DjangoApiError) {
        lastError = error;
        if (error.status < 500) throw error;
      } else if (error?.name === 'AbortError') {
        lastError = new DjangoApiError('Request timed out.', 408, undefined, true);
      } else {
        lastError = new DjangoApiError(error?.message || 'Network connection error. Please check your connection.', 0);
      }

      if (attempt === maxAttempts - 1) throw lastError;
      await sleep(2 ** attempt * 250 + Math.random() * 100);
    }
  }

  throw lastError ?? new DjangoApiError('Unknown request failure.', 0);
}
