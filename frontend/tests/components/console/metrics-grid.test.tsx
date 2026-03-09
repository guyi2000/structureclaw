import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsGrid } from '@/components/console/result-display/metrics-grid'

describe('MetricsGrid (CONS-09)', () => {
  it('renders without crashing when metrics undefined', () => {
    const { container } = render(<MetricsGrid metrics={undefined} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays all metrics when provided', () => {
    const metrics = {
      toolCount: 5,
      failedToolCount: 1,
      totalToolDurationMs: 1500,
      maxToolDurationMs: 500,
    }
    render(<MetricsGrid metrics={metrics} />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('1500')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('shows "-" for undefined values', () => {
    render(<MetricsGrid metrics={{}} />)

    // Should show 4 dashes for 4 undefined metrics
    const dashes = screen.getAllByText('-')
    expect(dashes).toHaveLength(4)
  })

  it('displays numbers when values present', () => {
    const metrics = {
      toolCount: 10,
    }
    render(<MetricsGrid metrics={metrics} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('uses grid layout', () => {
    const { container } = render(<MetricsGrid metrics={{ toolCount: 1 }} />)
    const grid = container.firstChild as HTMLElement
    expect(grid.className).toMatch(/grid/)
  })
})
