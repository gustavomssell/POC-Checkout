import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/checkout-builder/ThemeProvider'
import { FixedCheckoutForm } from '@/components/checkout-builder/FixedCheckoutForm'
import { SecurePurchaseSidebar } from '@/components/checkout-builder/SecurePurchaseSidebar'
import { DEFAULT_THEME } from '@/types/checkout'
import type { ThemeConfig } from '@/types/checkout'

const CUSTOM_THEME: ThemeConfig = {
  ...DEFAULT_THEME,
  colors: {
    ...DEFAULT_THEME.colors,
    primaryText: '#ff0000',
    secondaryText: '#00ff00',
    activeText: '#0000ff',
  },
  buttons: {
    ...DEFAULT_THEME.buttons,
    selected: { textColor: '#111111', backgroundColor: '#222222', iconColor: '#333333' },
  },
}

describe('ThemeProvider', () => {
  it('expõe as variáveis CSS no wrapper', () => {
    const { container } = render(
      <ThemeProvider theme={CUSTOM_THEME}>
        <span>filho</span>
      </ThemeProvider>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.getPropertyValue('--theme-primary-text')).toBe('#ff0000')
    expect(wrapper.style.getPropertyValue('--theme-secondary-text')).toBe('#00ff00')
    expect(wrapper.style.getPropertyValue('--theme-active-text')).toBe('#0000ff')
    expect(wrapper.style.getPropertyValue('--theme-btn-selected-bg')).toBe('#222222')
    expect(wrapper.style.getPropertyValue('--theme-btn-selected-text')).toBe('#111111')
    expect(wrapper.style.getPropertyValue('--theme-form-background')).toBe(
      DEFAULT_THEME.colors.formBackground,
    )
  })
})

describe('FixedCheckoutForm consome o tema', () => {
  it('título usa texto primário e botão pagar usa botão selecionado', () => {
    const { container } = render(
      <ThemeProvider theme={CUSTOM_THEME}>
        <FixedCheckoutForm />
      </ThemeProvider>,
    )
    const title = screen.getByText('Produto Exemplo', { selector: 'h2' })
    expect(title.getAttribute('class')).toContain('text-[var(--theme-primary-text)]')

    const payButton = screen.getByText('Pagar com Cartão de Crédito')
    expect(payButton.getAttribute('class')).toContain('bg-[var(--theme-btn-selected-bg)]')
    expect(payButton.getAttribute('class')).toContain('text-[var(--theme-btn-selected-text)]')

    // Método de pagamento selecionado usa as vars de selecionado
    const selected = container.querySelector('.border-\\[var\\(--theme-active-text\\)\\]')
    expect(selected).not.toBeNull()
  })
})

describe('SecurePurchaseSidebar consome o tema', () => {
  it('total usa texto ativo e fundo usa form-background', () => {
    const { container } = render(
      <ThemeProvider theme={CUSTOM_THEME}>
        <SecurePurchaseSidebar productName="Prod" productPrice={100} />
      </ThemeProvider>,
    )
    const total = container.querySelector('p.text-3xl')
    expect(total?.getAttribute('class')).toContain('text-[var(--theme-active-text)]')
    expect(total?.textContent).toContain('100,00')

    const header = screen.getByText('Compra segura').closest('div')
    expect(header?.getAttribute('class')).toContain('bg-[var(--theme-btn-selected-bg)]')

    expect(container.innerHTML).toContain('bg-[var(--theme-form-background)]')
  })
})
