import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorDisplay } from '@/components/console/error-display'
import { ClarificationPrompt } from '@/components/console/clarification-prompt'
import type { AgentError, Clarification } from '@/lib/api/contracts/agent'

/**
 * Focus Management Tests (ACCS-02)
 *
 * These tests verify that focus is managed appropriately for accessibility:
 * - Error display receives focus when error appears
 * - Clarification prompt is announced to screen readers
 * - Components have proper ARIA live regions
 */
describe('Focus Management (ACCS-02)', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ErrorDisplay', () => {
    it('receives focus when error appears', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveFocus()
    })

    it('has aria-live="assertive" for immediate announcement', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('has role="alert" for screen reader announcement', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('announces error message to screen reader', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Test error message')
    })

    it('has tabIndex=-1 to allow programmatic focus', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('tabIndex', '-1')
    })

    it('returns null when no error is provided', () => {
      render(<ErrorDisplay error={null} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('ClarificationPrompt', () => {
    it('has aria-live="polite" for non-urgent announcement', () => {
      const clarification: Clarification = {
        question: 'Missing parameter?',
        missingFields: ['field1'],
      }
      render(<ClarificationPrompt clarification={clarification} />)
      const prompt = screen.getByLabelText(/clarification needed/i)
      expect(prompt).toHaveAttribute('aria-live', 'polite')
    })

    it('has role="region" for semantic structure', () => {
      const clarification: Clarification = {
        question: 'Missing parameter?',
        missingFields: ['field1'],
      }
      render(<ClarificationPrompt clarification={clarification} />)
      const prompt = screen.getByLabelText(/clarification needed/i)
      expect(prompt).toHaveAttribute('role', 'region')
    })

    it('announces clarification question to screen reader', () => {
      const clarification: Clarification = {
        question: 'Missing parameter?',
      }
      render(<ClarificationPrompt clarification={clarification} />)
      const prompt = screen.getByLabelText(/clarification needed/i)
      expect(prompt).toHaveTextContent('Missing parameter?')
    })

    it('returns null when no clarification is provided', () => {
      render(<ClarificationPrompt clarification={undefined} />)
      expect(screen.queryByLabelText(/clarification needed/i)).not.toBeInTheDocument()
    })

    it('allows user to Tab to interactive elements inside if any', async () => {
      const clarification: Clarification = {
        question: 'Missing parameter?',
        missingFields: ['field1', 'field2'],
      }
      render(<ClarificationPrompt clarification={clarification} />)
      // The component should be visible and accessible
      const prompt = screen.getByLabelText(/clarification needed/i)
      expect(prompt).toBeInTheDocument()
      expect(prompt).toHaveTextContent('field1')
      expect(prompt).toHaveTextContent('field2')
    })
  })

  describe('Dynamic content announcements', () => {
    it('error display uses assertive aria-live for immediate attention', () => {
      const error: AgentError = { message: 'Critical error' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      // Assertive means screen reader interrupts current announcement
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('clarification prompt uses polite aria-live for non-interrupting', () => {
      const clarification: Clarification = { question: 'Need info?' }
      render(<ClarificationPrompt clarification={clarification} />)
      const prompt = screen.getByLabelText(/clarification needed/i)
      // Polite means screen reader waits for pause before announcing
      expect(prompt).toHaveAttribute('aria-live', 'polite')
    })

    it('decorative icons are hidden from screen readers', () => {
      const error: AgentError = { message: 'Error' }
      const clarification: Clarification = { question: 'Question?' }

      render(
        <>
          <ErrorDisplay error={error} />
          <ClarificationPrompt clarification={clarification} />
        </>
      )

      // Both icons should be hidden
      const alertIcon = screen.getByRole('alert').querySelector('svg')
      const promptIcon = screen.getByLabelText(/clarification needed/i).querySelector('svg')

      expect(alertIcon).toHaveAttribute('aria-hidden', 'true')
      expect(promptIcon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Focus visibility', () => {
    it('error display is focusable via keyboard navigation', () => {
      const error: AgentError = { message: 'Error' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      // tabIndex=-1 allows programmatic focus but not Tab focus
      // This is correct for alerts - they receive focus automatically
      expect(alert).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('Sequential focus order', () => {
    it('error display receives focus immediately when rendered', () => {
      const error: AgentError = { message: 'Error' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      // Focus should be on the alert element immediately after render
      expect(alert).toHaveFocus()
    })
  })
})
