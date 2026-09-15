import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('Router', () => {
  beforeEach(resetStore)

  it('rota desconhecida renderiza 404', () => {
    renderAt('/rota-que-nao-existe')
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para checkouts' })).toHaveAttribute(
      'href',
      '/checkouts',
    )
  })

  it('/ redireciona para /checkouts (dashboard)', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Checkout Builder' })).toBeInTheDocument()
  })

  it('id inexistente redireciona para /checkouts', () => {
    renderAt('/checkouts/id-que-nao-existe')
    expect(screen.getByRole('heading', { name: 'Checkout Builder' })).toBeInTheDocument()
  })

  it('id inexistente no flow redireciona para /checkouts', () => {
    renderAt('/checkouts/id-que-nao-existe/flow')
    expect(screen.getByRole('heading', { name: 'Checkout Builder' })).toBeInTheDocument()
  })
})
