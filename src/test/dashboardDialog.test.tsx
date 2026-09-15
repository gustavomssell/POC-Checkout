import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '@/app/router'
import { AppProviders } from '@/app/providers'
import { useCheckoutStore } from '@/stores/checkoutStore'

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

function resetStore() {
  useCheckoutStore.setState({
    templates: [],
    currentTemplate: null,
    selectedComponentId: null,
  })
}

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('Dashboard: dialog Criar checkout', () => {
  beforeEach(resetStore)

  it('abre com contraste nos campos e cria navegando para o editor', () => {
    renderAt('/checkouts')

    fireEvent.click(screen.getByRole('button', { name: /novo checkout/i }))
    expect(screen.getByRole('heading', { name: 'Criar Novo Checkout' })).toBeInTheDocument()

    // Campos com fundo próprio para contraste com o dialog
    const nameInput = screen.getByLabelText('Nome')
    expect(nameInput.getAttribute('class')).toContain('bg-muted')

    fireEvent.change(nameInput, { target: { value: 'Checkout de Teste' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    // Caiu no editor com o template criado (nome no header e no formulário)
    expect(screen.getAllByText('Checkout de Teste').length).toBeGreaterThanOrEqual(1)
    const { currentTemplate } = useCheckoutStore.getState()
    expect(currentTemplate?.name).toBe('Checkout de Teste')
  })
})
