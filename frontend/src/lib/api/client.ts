import { ApiError, NetworkError } from './errors'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * Handle HTTP response, throwing ApiError for non-ok responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = undefined
    }
    throw new ApiError(response.status, response.statusText, data)
  }
  return response.json() as Promise<T>
}

/**
 * Centralized fetch wrapper with typed responses and error handling
 */
export async function apiClient<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const { body, headers, ...restOptions } = options || {}

  const config: RequestInit = {
    method: 'GET',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    return handleResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new NetworkError(error instanceof Error ? error.message : 'Network request failed')
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
