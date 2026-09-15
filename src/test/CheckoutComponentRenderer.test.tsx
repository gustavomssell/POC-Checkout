import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckoutComponentRenderer } from '@/components/checkout-builder/CheckoutComponentRenderer'
import type { CheckoutComponent } from '@/types/checkout'

describe('CheckoutComponentRenderer', () => {
  it('should render header component', () => {
    const component: CheckoutComponent = {
      id: 'test-1',
      type: 'header',
      props: {
        logoUrl: '',
        breadcrumbs: ['Carrinho', 'Pagamento'],
      },
      order: 0,
    }

    render(<CheckoutComponentRenderer component={component} />)
    expect(screen.getByText('Carrinho')).toBeInTheDocument()
    expect(screen.getByText('Pagamento')).toBeInTheDocument()
  })

  it('should render product card component', () => {
    const component: CheckoutComponent = {
      id: 'test-2',
      type: 'product-card',
      props: {
        name: 'Produto Teste',
        price: 197,
        originalPrice: 297,
        description: 'Descrição do produto',
      },
      order: 0,
    }

    render(<CheckoutComponentRenderer component={component} />)
    expect(screen.getByText('Produto Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição do produto')).toBeInTheDocument()
  })

  it('should render footer component', () => {
    const component: CheckoutComponent = {
      id: 'test-3',
      type: 'footer',
      props: {
        companyName: 'Empresa Teste',
        cnpj: '00.000.000/0001-00',
        address: 'Rua Teste, 123',
      },
      order: 0,
    }

    render(<CheckoutComponentRenderer component={component} />)
    expect(screen.getByText('Empresa Teste')).toBeInTheDocument()
    expect(screen.getByText('CNPJ: 00.000.000/0001-00')).toBeInTheDocument()
  })

  it('should apply selected styles when isSelected is true', () => {
    const component: CheckoutComponent = {
      id: 'test-4',
      type: 'header',
      props: {},
      order: 0,
    }

    const { container } = render(
      <CheckoutComponentRenderer component={component} isSelected={true} />
    )
    expect(container.firstChild).toHaveClass('border-emerald-500')
  })

  it('should show drop target indicator when isDropTarget is true', () => {
    const component: CheckoutComponent = {
      id: 'test-drop',
      type: 'header',
      props: {},
      order: 0,
    }

    const { container } = render(
      <CheckoutComponentRenderer component={component} isDropTarget={true} />
    )
    expect(screen.getByText('Soltar aqui')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('border-dashed')
  })

  it('should not show drop target indicator by default', () => {
    const component: CheckoutComponent = {
      id: 'test-nodrop',
      type: 'header',
      props: {},
      order: 0,
    }

    render(<CheckoutComponentRenderer component={component} />)
    expect(screen.queryByText('Soltar aqui')).not.toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const component: CheckoutComponent = {
      id: 'test-5',
      type: 'header',
      props: {
        breadcrumbs: ['Carrinho'],
      },
      order: 0,
    }

    const onClick = vi.fn()
    const { container } = render(
      <CheckoutComponentRenderer component={component} onClick={onClick} />
    )
    
    container.firstChild && (container.firstChild as HTMLElement).click()
    expect(onClick).toHaveBeenCalled()
  })
})
