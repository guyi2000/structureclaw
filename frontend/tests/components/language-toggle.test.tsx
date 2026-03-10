import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppStoreProvider, useStore } from '@/lib/stores/context'
import { LanguageToggle } from '@/components/language-toggle'

describe('LanguageToggle', () => {
  it('defaults to EN in a fresh store', () => {
    render(
      <AppStoreProvider>
        <LanguageToggle />
      </AppStoreProvider>
    )

    const englishButton = screen.getByRole('button', { name: /switch language to english/i })
    expect(englishButton).toBeInTheDocument()
  })

  it('updates locale to zh when Chinese button is clicked', () => {
    function LocaleReader() {
      const locale = useStore((state) => state.locale)
      return <span data-testid="locale-value">{locale}</span>
    }

    render(
      <AppStoreProvider>
        <LanguageToggle />
        <LocaleReader />
      </AppStoreProvider>
    )

    const chineseButton = screen.getByRole('button', { name: /切换语言为中文/i })
    fireEvent.click(chineseButton)

    expect(screen.getByTestId('locale-value')).toHaveTextContent('zh')
  })
})
