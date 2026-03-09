import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '@/app/(marketing)/page'

describe('Home Page Integration (PAGE-01)', () => {
  it('renders with main landmark', () => {
    render(<HomePage />)

    // Should have a main element for landmark navigation
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('has h1 with proper id for aria-labelledby', () => {
    render(<HomePage />)

    // h1 should have id="hero-heading" for aria-labelledby reference
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveAttribute('id', 'hero-heading')
    expect(heading).toHaveTextContent('StructureClaw')
  })

  it('hero section has aria-labelledby pointing to h1', () => {
    render(<HomePage />)

    // Hero section should be labeled by the h1
    const heroSection = document.querySelector('[aria-labelledby="hero-heading"]')
    expect(heroSection).toBeInTheDocument()
  })

  it('features section has aria-labelledby pointing to h2', () => {
    render(<HomePage />)

    // Features section should be labeled by h2
    const featuresSection = document.querySelector('[aria-labelledby="features-heading"]')
    expect(featuresSection).toBeInTheDocument()
  })

  it('renders feature cards with icons', () => {
    render(<HomePage />)

    // Should have feature cards with titles
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument()
    expect(screen.getByText('GB50017 Compliant')).toBeInTheDocument()
    expect(screen.getByText('Auto Report Generation')).toBeInTheDocument()

    // Each feature card should be in a Card component
    const cards = document.querySelectorAll('[class*="rounded-lg"][class*="border"][class*="bg-card"]')
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })

  it('CTA button links to console', () => {
    render(<HomePage />)

    // CTA should be a link pointing to /console
    const ctaLink = screen.getByRole('link', { name: /enter.*console/i })
    expect(ctaLink).toHaveAttribute('href', '/console')
  })

  it('CTA button has accessible aria-label', () => {
    render(<HomePage />)

    // CTA should have accessible label
    const ctaLink = screen.getByRole('link', { name: /enter.*console/i })
    expect(ctaLink).toBeInTheDocument()
  })

  it('all interactive elements are keyboard accessible', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    // Tab should reach the CTA link
    await user.tab()
    const ctaLink = screen.getByRole('link', { name: /enter.*console/i })
    expect(ctaLink).toHaveFocus()
  })

  it('decorative icons have aria-hidden', () => {
    render(<HomePage />)

    // Decorative icons in feature cards should be aria-hidden
    const hiddenIcons = document.querySelectorAll('svg[aria-hidden="true"]')
    expect(hiddenIcons.length).toBeGreaterThan(0)
  })

  it('keeps Chinese description for consistency', () => {
    render(<HomePage />)

    // Should include Chinese text for product description
    expect(screen.getByText(/结构工程 AI 工作台/)).toBeInTheDocument()
  })
})
