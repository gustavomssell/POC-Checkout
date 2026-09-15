import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'
import { CheckoutComponentRenderer } from '@/components/checkout-builder/CheckoutComponentRenderer'
import { CheckoutRenderer as PreviewRenderer } from '@/components/preview/CheckoutRenderer'
import { PropertyPanel } from '@/components/checkout-builder/PropertyPanel'
import type { CheckoutComponent, ComponentType } from '@/types/checkout'

const ALL_TYPES: ComponentType[] = [
  'header',
  'product-card',
  'form-field',
  'payment-methods',
  'order-summary',
  'upsell',
  'guarantees',
  'footer',
  'grid-1',
  'grid-2',
  'grid-3',
  'grid-4',
  'testimonial',
  'countdown',
  'benefits',
  'faq',
  'video',
  'social-proof',
  'coupon',
  'bump-offer',
]

// Texto âncora esperado no builder quando o componente usa os defaultProps
const EXPECTED_TEXT: Partial<Record<ComponentType, string>> = {
  header: 'Carrinho',
  'product-card': 'Produto Exemplo',
  'form-field': 'Dados Pessoais',
  'payment-methods': 'Cartão de Crédito',
  'order-summary': 'Resumo do Pedido',
  upsell: 'Oferta Especial',
  guarantees: 'Compra Segura',
  footer: 'Empresa Exemplo',
  testimonial: 'Maria Silva',
  countdown: 'Oferta termina em:',
  benefits: 'Acesso imediato após a compra',
  faq: 'Como recebo o produto?',
  video: 'Assista ao vídeo de apresentação',
  'social-proof': '47',
  coupon: 'Possui cupom de desconto?',
  'bump-offer': 'Adicione o Pack Completo!',
}

const GRID_COLUMNS: Partial<Record<ComponentType, number>> = {
  'grid-1': 1,
  'grid-2': 2,
  'grid-3': 3,
  'grid-4': 4,
}

function makeComponent(
  type: ComponentType,
  props: Record<string, unknown> = {},
  id = `test-${type}`,
): CheckoutComponent {
  const config = CHECKOUT_COMPONENTS.find((c) => c.type === type)
  return {
    id,
    type,
    props: { ...config?.defaultProps, ...props },
    order: 0,
    gridColumns: config?.gridColumns,
    children: config?.isGrid ? [] : undefined,
  }
}

function resetStore() {
  useCheckoutStore.setState({
    templates: [],
    currentTemplate: null,
    selectedComponentId: null,
  })
}

describe('Palette coverage', () => {
  it('todos os tipos esperados existem na paleta', () => {
    const paletteTypes = CHECKOUT_COMPONENTS.map((c) => c.type)
    for (const type of ALL_TYPES) {
      expect(paletteTypes).toContain(type)
    }
  })

  it('todo item da paleta tem nome, descrição, ícone e defaultProps', () => {
    for (const config of CHECKOUT_COMPONENTS) {
      expect(config.name, `${config.type} name`).toBeTruthy()
      expect(config.description, `${config.type} description`).toBeTruthy()
      expect(config.icon, `${config.type} icon`).toBeTruthy()
      expect(config.defaultProps, `${config.type} defaultProps`).toBeDefined()
    }
  })
})

describe('Store: addComponent para todos os tipos', () => {
  beforeEach(resetStore)

  it.each(ALL_TYPES)('cria %s com defaults', (type) => {
    const { createTemplate, addComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent(type)

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    const config = CHECKOUT_COMPONENTS.find((c) => c.type === type)
    expect(component?.type).toBe(type)
    expect(component?.id).toBeTruthy()
    expect(component?.props).toEqual(config?.defaultProps)
    // Sem auto-seleção: o modal abre só no clique
    expect(useCheckoutStore.getState().selectedComponentId).toBeNull()
  })

  it.each(Object.keys(GRID_COLUMNS) as ComponentType[])(
    '%s nasce como grid vazio com colunas corretas',
    (type) => {
      const { createTemplate, addComponent } = useCheckoutStore.getState()
      createTemplate('T', 'D')
      addComponent(type)

      const component = useCheckoutStore.getState().currentTemplate?.components[0]
      expect(component?.children).toEqual([])
      expect(component?.gridColumns).toBe(GRID_COLUMNS[type])
    },
  )
})

describe('Builder: renderiza todos os tipos com defaults', () => {
  it.each(ALL_TYPES)('renderiza %s sem quebrar', (type) => {
    const component = makeComponent(type)
    const cells = GRID_COLUMNS[type]

    if (cells) {
      render(
        <DndContext>
          <CheckoutComponentRenderer component={component} />
        </DndContext>,
      )
      // N células vazias com placeholder
      expect(screen.getAllByText('Arraste um componente aqui')).toHaveLength(cells)
    } else {
      render(<CheckoutComponentRenderer component={component} />)
      const expected = EXPECTED_TEXT[type]
      expect(expected, `texto âncora de ${type}`).toBeTruthy()
      expect(screen.getByText(expected!)).toBeInTheDocument()
    }
  })
})

describe('Builder: renderiza todos os tipos com props vazias (robustez)', () => {
  it.each(ALL_TYPES)('%s com props {} não quebra', (type) => {
    const component: CheckoutComponent = {
      id: `empty-${type}`,
      type,
      props: {},
      order: 0,
    }
    if (GRID_COLUMNS[type]) {
      render(
        <DndContext>
          <CheckoutComponentRenderer component={component} />
        </DndContext>,
      )
    } else {
      render(<CheckoutComponentRenderer component={component} />)
    }
    // Se chegou aqui sem throw, passou
    expect(document.body).toBeInTheDocument()
  })
})

describe('Builder: comportamentos específicos', () => {
  it('video com URL do YouTube renderiza iframe de embed', () => {
    const component = makeComponent('video', {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Meu vídeo',
    })
    const { container } = render(<CheckoutComponentRenderer component={component} />)
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.getAttribute('src')).toContain('youtube.com/embed/dQw4w9WgXcQ')
  })

  it('video sem URL mostra placeholder', () => {
    const component = makeComponent('video', { url: '', title: '' })
    render(<CheckoutComponentRenderer component={component} />)
    expect(screen.getByText('Adicione um vídeo do YouTube')).toBeInTheDocument()
  })

  it('form-field renderiza os 4 campos padrão', () => {
    const { container } = render(
      <CheckoutComponentRenderer component={makeComponent('form-field')} />,
    )
    expect(container.querySelectorAll('label').length).toBe(4)
  })

  it('grid-2 renderiza filho aninhado dentro da célula', () => {
    const child = makeComponent('coupon', {}, 'child-1')
    const grid: CheckoutComponent = {
      ...makeComponent('grid-2', {}, 'grid-1'),
      children: [child],
    }
    render(
      <DndContext>
        <CheckoutComponentRenderer component={grid} />
      </DndContext>,
    )
    expect(screen.getByText('Possui cupom de desconto?')).toBeInTheDocument()
    // 1 célula ocupada + 1 placeholder
    expect(screen.getAllByText('Arraste um componente aqui')).toHaveLength(1)
  })

  it('boleto usa ícone em vez de texto solto', () => {
    const { container } = render(
      <CheckoutComponentRenderer component={makeComponent('payment-methods')} />,
    )
    expect(container.innerHTML).not.toContain('barcode')
    expect(screen.getByText('Boleto')).toBeInTheDocument()
  })

  it('fullWidth false limita a faixa no builder', () => {
    const component = { ...makeComponent('coupon'), fullWidth: false }
    const { container } = render(<CheckoutComponentRenderer component={component} />)
    expect(container.firstChild).toHaveClass('max-w-md')
  })

  it('fullWidth padrão ocupa a faixa toda no builder', () => {
    const { container } = render(
      <CheckoutComponentRenderer component={makeComponent('coupon')} />,
    )
    expect(container.firstChild).not.toHaveClass('max-w-md')
  })

  it('payment-methods respeita métodos configurados', () => {
    const component = makeComponent('payment-methods', { methods: ['pix'] })
    render(<CheckoutComponentRenderer component={component} />)
    expect(screen.getByText('PIX')).toBeInTheDocument()
    expect(screen.queryByText('Cartão de Crédito')).not.toBeInTheDocument()
    expect(screen.queryByText('Boleto')).not.toBeInTheDocument()
  })
})

describe('Preview: renderiza todos os tipos', () => {
  it.each(ALL_TYPES.filter((t) => !['product-card', 'form-field', 'payment-methods', 'order-summary'].includes(t)))(
    'preview de %s sem quebrar',
    (type) => {
      const component = makeComponent(type, {}, `preview-${type}`)
      render(<PreviewRenderer components={[component]} />)
      const expected = EXPECTED_TEXT[type]
      if (expected) {
        expect(screen.getByText(expected)).toBeInTheDocument()
      }
    },
  )

  it('sempre mostra o conteúdo padrão mesmo sem componentes', () => {
    render(<PreviewRenderer components={[]} productName="Meu Produto" />)
    // Nome aparece no título, no resumo e na sidebar, igual ao builder
    expect(screen.getAllByText('Meu Produto')).toHaveLength(3)
    expect(screen.getByText('Seus dados')).toBeInTheDocument()
    expect(screen.getByText('Pagamento')).toBeInTheDocument()
    expect(screen.getByText('Pagar com Cartão de Crédito')).toBeInTheDocument()
    expect(screen.getByText('Compra segura')).toBeInTheDocument()
    expect(screen.getByText('Renovação atual')).toBeInTheDocument()
  })

  it('filtra componentes fixos legados (sem duplicar o formulário)', () => {
    const legacy = makeComponent('product-card', { name: 'Produto Legado' }, 'preview-legacy')
    render(<PreviewRenderer components={[legacy]} productName="Produto Principal" />)
    expect(screen.getAllByText('Produto Principal')).toHaveLength(3)
    expect(screen.queryByText('Produto Legado')).not.toBeInTheDocument()
  })

  it('não renderiza previews avulsos de form-field/payment/order-summary', () => {
    render(
      <PreviewRenderer
        components={[
          makeComponent('form-field', {}, 'p-ff'),
          makeComponent('payment-methods', {}, 'p-pm'),
          makeComponent('order-summary', {}, 'p-os'),
        ]}
      />,
    )
    // Títulos exclusivos dos previews avulsos não aparecem; só o formulário fixo
    expect(screen.queryByText('Dados Pessoais')).not.toBeInTheDocument()
    expect(screen.queryByText('Forma de Pagamento')).not.toBeInTheDocument()
    expect(screen.queryByText('Resumo do Pedido')).not.toBeInTheDocument()
    expect(screen.getByText('Seus dados')).toBeInTheDocument()
  })

  it('usa layout empilhado no mobile (container queries + compact)', () => {
    render(
      <PreviewRenderer
        mode="mobile"
        components={[
          {
            ...makeComponent('grid-2', {}, 'p-grid'),
            children: [makeComponent('coupon', {}, 'p-child')],
          },
        ]}
      />,
    )
    // Grid do preview: 1 coluna no mobile, N colunas a partir de sm
    const grid = screen.getByText('Possui cupom de desconto?').closest('.grid')
    expect(grid?.getAttribute('class')).toContain('grid-cols-1')
    expect(grid?.getAttribute('class')).toContain('@sm:grid-cols-2')
    // CPF/Celular do formulário fixo: empilhados via prop compact
    const cpfGrid = screen.getByText('CPF').closest('.grid')
    expect(cpfGrid?.getAttribute('class')).toContain('grid-cols-1')
    expect(cpfGrid?.getAttribute('class')).not.toContain('grid-cols-2')
  })

  it('formulário fixo lado a lado no desktop', () => {
    render(<PreviewRenderer mode="desktop" components={[]} />)
    const cpfGrid = screen.getByText('CPF').closest('.grid')
    expect(cpfGrid?.getAttribute('class')).toContain('grid-cols-2')
    expect(cpfGrid?.getAttribute('class')).not.toMatch(/(^| )grid-cols-1( |$)/)
  })

  it('modo mobile renderiza o mesmo conteúdo empilhado', () => {
    const { container } = render(
      <PreviewRenderer
        mode="mobile"
        productName="Meu Produto"
        components={[{ ...makeComponent('footer', {}, 'p-foot'), placement: 'sidebar' }]}
      />,
    )
    expect(screen.getByText('Seus dados')).toBeInTheDocument()
    expect(screen.getByText('Compra segura')).toBeInTheDocument()
    expect(container.querySelector('.flex-col')).not.toBeNull()
  })

  it('preview limita componente sem fullWidth', () => {
    const component = { ...makeComponent('coupon', {}, 'preview-narrow'), fullWidth: false }
    const { container } = render(<PreviewRenderer components={[component]} />)
    expect(container.querySelector('.max-w-md')).not.toBeNull()
  })

  it('preview de grid renderiza os filhos nas colunas', () => {
    const grid: CheckoutComponent = {
      ...makeComponent('grid-2', {}, 'preview-grid'),
      children: [makeComponent('coupon', {}, 'preview-child')],
    }
    render(<PreviewRenderer components={[grid]} />)
    expect(screen.getByText('Possui cupom de desconto?')).toBeInTheDocument()
  })

  it('preview ordena above antes de below e sidebar por último', () => {
    const below: CheckoutComponent = { ...makeComponent('footer', {}, 'p-below'), placement: 'below', order: 0 }
    const sidebar: CheckoutComponent = { ...makeComponent('coupon', {}, 'p-side'), placement: 'sidebar', order: 0 }
    const above: CheckoutComponent = { ...makeComponent('header', {}, 'p-above'), placement: 'above', order: 5 }
    const { container } = render(
      <PreviewRenderer components={[below, sidebar, above]} />,
    )
    const text = container.textContent ?? ''
    expect(text.indexOf('Carrinho')).toBeLessThan(text.indexOf('Empresa Exemplo'))
    expect(text.indexOf('Empresa Exemplo')).toBeLessThan(text.indexOf('Possui cupom'))
    // Zonas em relação ao formulário fixo e à sidebar
    expect(text.indexOf('Carrinho')).toBeLessThan(text.indexOf('Seus dados'))
    expect(text.indexOf('Renovação atual')).toBeLessThan(text.indexOf('Possui cupom'))
  })
})

describe('PropertyPanel: todos os tipos', () => {
  beforeEach(resetStore)

  it.each(ALL_TYPES)('abre painel de %s', (type) => {
    const { createTemplate, addComponent, selectComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent(type)
    selectComponent(useCheckoutStore.getState().currentTemplate?.components[0].id ?? null)

    render(<PropertyPanel />)
    const config = CHECKOUT_COMPONENTS.find((c) => c.type === type)
    expect(screen.getByRole('heading', { name: config!.name })).toBeInTheDocument()
  })

  it('editar nome do produto atualiza a store', () => {
    const { createTemplate, addComponent, selectComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent('product-card')
    selectComponent(useCheckoutStore.getState().currentTemplate?.components[0].id ?? null)

    render(<PropertyPanel />)
    const input = screen.getByDisplayValue('Produto Exemplo')
    fireEvent.change(input, { target: { value: 'Meu Produto Novo' } })

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.props.name).toBe('Meu Produto Novo')
  })

  it('editar preço do upsell atualiza a store', () => {
    const { createTemplate, addComponent, selectComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent('upsell')
    selectComponent(useCheckoutStore.getState().currentTemplate?.components[0].id ?? null)

    render(<PropertyPanel />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThan(0)
    fireEvent.change(inputs[0], { target: { value: '123' } })

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.props.price).toBe(123)
  })
})
