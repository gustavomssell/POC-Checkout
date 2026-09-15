import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CheckoutEditor } from '@/components/checkout-builder/CheckoutEditor'
import { ComponentPalette } from '@/components/checkout-builder/ComponentPalette'
import { ToastProvider } from '@/components/ui/toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useCheckoutStore } from '@/stores/checkoutStore'

function resetStore() {
  useCheckoutStore.setState({
    templates: [],
    currentTemplate: null,
    selectedComponentId: null,
  })
}

// jsdom não tem matchMedia (usado pelo ThemeProvider do app)
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}))

describe('System theme: editor chrome respeita claro/escuro', () => {
  beforeEach(resetStore)

  it('root e header usam tokens no claro e visual escuro no dark', () => {
    const { container } = render(
      <ThemeProvider>
        <ToastProvider>
          <CheckoutEditor />
        </ToastProvider>
      </ThemeProvider>,
    )

    const root = container.firstChild as HTMLElement
    expect(root.getAttribute('class')).toContain('bg-background')
    expect(root.getAttribute('class')).toContain('dark:bg-[#0b0e0e]')

    const header = container.querySelector('header')
    expect(header?.getAttribute('class')).toContain('bg-card')
    expect(header?.getAttribute('class')).toContain('dark:bg-[#0b0e0e]')
    expect(header?.getAttribute('class')).toContain('border-border')
    expect(header?.getAttribute('class')).toContain('dark:border-white/10')
  })

  it('painel lateral da paleta usa sidebar no claro e escuro fixo no dark', () => {
    const { container } = render(<ComponentPalette />)
    const root = container.firstChild as HTMLElement
    expect(root.getAttribute('class')).toContain('bg-sidebar')
    expect(root.getAttribute('class')).toContain('dark:bg-[#0b0e0e]')
  })
})
