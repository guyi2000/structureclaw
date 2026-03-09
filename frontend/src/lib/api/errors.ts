/**
 * Error thrown for HTTP error responses (4xx, 5xx)
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * Error thrown for network failures (no response, DNS issues, etc.)
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}
