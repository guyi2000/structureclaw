import { describe, it, expect } from 'vitest'
import { ApiError, NetworkError } from '@/lib/api/errors'

describe('API Error Classes', () => {
  describe('ApiError', () => {
    it('has status, statusText, and optional data properties', () => {
      const data = { message: 'Not found' }
      const error = new ApiError(404, 'Not Found', data)

      expect(error.status).toBe(404)
      expect(error.statusText).toBe('Not Found')
      expect(error.data).toEqual(data)
    })

    it('message includes status and statusText', () => {
      const error = new ApiError(500, 'Internal Server Error')

      expect(error.message).toBe('API Error: 500 Internal Server Error')
    })

    it('works without data property', () => {
      const error = new ApiError(401, 'Unauthorized')

      expect(error.status).toBe(401)
      expect(error.statusText).toBe('Unauthorized')
      expect(error.data).toBeUndefined()
    })

    it('has correct name property', () => {
      const error = new ApiError(404, 'Not Found')

      expect(error.name).toBe('ApiError')
    })
  })

  describe('NetworkError', () => {
    it('has default message', () => {
      const error = new NetworkError()

      expect(error.message).toBe('Network request failed')
    })

    it('accepts custom message', () => {
      const error = new NetworkError('Connection refused')

      expect(error.message).toBe('Connection refused')
    })

    it('has correct name property', () => {
      const error = new NetworkError()

      expect(error.name).toBe('NetworkError')
    })
  })
})
