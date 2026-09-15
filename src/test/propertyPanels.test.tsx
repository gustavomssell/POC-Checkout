import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyPanel, ComponentPropertiesDialog } from '@/components/checkout-builder/PropertyPanel'
import { FlowPropertyPanel, FlowPropertiesDialog } from '@/components/flow-builder/FlowPropertyPanel'
import { useCheckoutStore } from '@/stores/checkoutStore'
import type { Node } from '@xyflow/react'

function resetStore() {
  useCheckoutStore.setState({
    templates: [],
    currentTemplate: null,
    selectedComponentId: null,
  })
}

function openPanel(type: Parameters<typeof useCheckoutStore.getState.addComponent>[0]) {
  const { createTemplate, addComponent, selectComponent } = useCheckoutStore.getState()
  createTemplate('T', 'D')
  addComponent(type)
  const id = useCheckoutStore.getState().currentTemplate?.components[0].id
  selectComponent(id ?? null)
  render(<PropertyPanel />)
}

describe('PropertyPanel: novos controles', () => {
  beforeEach(resetStore)

  it('avaliação por estrelas atualiza a store', () => {
    openPanel('testimonial')
    fireEvent.click(screen.getByRole('button', { name: '3 de 5 estrelas' }))

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.props.rating).toBe(3)
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('toggle de método de pagamento ativa/desativa', () => {
    openPanel('payment-methods')

    // PIX vem ativo nos defaults — desativa e reativa
    const pix = screen.getByRole('button', { name: 'PIX' })
    expect(pix).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(pix)

    const afterOff = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(afterOff?.props.methods).not.toContain('pix')
    expect(screen.getByRole('button', { name: 'PIX' })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'PIX' }))
    const afterOn = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(afterOn?.props.methods).toContain('pix')
  })

  it('stepper de espaçamento do grid soma de 4 em 4', () => {
    openPanel('grid-2')
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar' }))

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.props.gap).toBe(20)
  })

  it('URL de vídeo mostra validação ao vivo', () => {
    openPanel('video')
    const input = screen.getByPlaceholderText('https://youtube.com/watch?v=...')

    fireEvent.change(input, { target: { value: 'notaurl' } })
    expect(screen.getByText(/não parece um vídeo do YouTube/)).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } })
    expect(screen.getByText(/URL válida/)).toBeInTheDocument()
  })

  it('avatar do depoimento atualiza a store', () => {
    openPanel('testimonial')
    fireEvent.change(screen.getByPlaceholderText('https://exemplo.com/foto.jpg'), {
      target: { value: 'https://exemplo.com/eu.jpg' },
    })

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.props.avatar).toBe('https://exemplo.com/eu.jpg')
  })

  it('desconto do resumo esconde campos quando desativado', () => {
    openPanel('order-summary')
    // Vem ativo nos defaults
    expect(screen.getByText('Rótulo do desconto')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Mostrar desconto' }))

    expect(screen.queryByText('Rótulo do desconto')).not.toBeInTheDocument()
    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.props.showDiscount).toBe(false)
  })

  it('flag de largura total alterna na store', () => {
    openPanel('coupon')
    expect(screen.getByText('Largura total')).toBeInTheDocument()

    const toggle = screen.getByRole('switch', { name: 'Largura total' })
    fireEvent.click(toggle)

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.fullWidth).toBe(false)
  })

  it('mostra selo de posição para componente acima do checkout', () => {
    const { createTemplate, addComponent, selectComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent('header', 'above')
    selectComponent(useCheckoutStore.getState().currentTemplate?.components[0].id ?? null)
    render(<PropertyPanel />)

    expect(screen.getByText('Acima do checkout')).toBeInTheDocument()
  })
})

describe('ComponentPropertiesDialog', () => {
  beforeEach(resetStore)

  it('abre modal ao selecionar componente e fecha ao clicar Fechar', () => {
    const { createTemplate, addComponent, selectComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent('coupon')
    selectComponent(useCheckoutStore.getState().currentTemplate?.components[0].id ?? null)

    render(<ComponentPropertiesDialog />)
    // h2 visível + título sr-only de acessibilidade
    expect(screen.getAllByRole('heading', { name: 'Cupom' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Chamada')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Fechar'))
    expect(useCheckoutStore.getState().selectedComponentId).toBeNull()
  })

  it('não renderiza nada sem seleção', () => {
    const { container } = render(<ComponentPropertiesDialog />)
    expect(container).toBeEmptyDOMElement()
  })

  it('adicionar componente não abre o modal (só o clique abre)', () => {
    const { createTemplate, addComponent } = useCheckoutStore.getState()
    createTemplate('T', 'D')
    addComponent('coupon')

    expect(useCheckoutStore.getState().selectedComponentId).toBeNull()
    const { container } = render(<ComponentPropertiesDialog />)
    expect(container).toBeEmptyDOMElement()
  })
})

function flowNode(type: string): Node {
  return {
    id: 'node-1',
    type,
    position: { x: 0, y: 0 },
    data: { label: 'Nó', type },
  } as unknown as Node
}

describe('FlowPropertyPanel', () => {
  it('cabeçalho mostra cor e nome do tipo', () => {
    render(
      <FlowPropertyPanel selectedNode={flowNode('email')} onUpdateNode={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getAllByRole('heading', { name: 'E-mail' }).length).toBeGreaterThanOrEqual(1)
  })

  it('método do webhook via segmentado', () => {
    const onUpdate = vi.fn()
    render(
      <FlowPropertyPanel selectedNode={flowNode('webhook')} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'PUT' }))
    expect(onUpdate).toHaveBeenCalledWith('node-1', { method: 'PUT' })
  })

  it('condition mostra dica de expressão', () => {
    render(
      <FlowPropertyPanel selectedNode={flowNode('condition')} onUpdateNode={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText('Ex: pagamento_aprovado == true')).toBeInTheDocument()
    expect(screen.getByText(/saída verde/)).toBeInTheDocument()
  })

  it('estado vazio orienta a selecionar', () => {
    render(<FlowPropertyPanel selectedNode={null} onUpdateNode={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Selecione um nó para editar')).toBeInTheDocument()
  })

  it('modal abre com o nó e fecha chamando onClose', () => {
    const onClose = vi.fn()
    render(
      <FlowPropertiesDialog selectedNode={flowNode('email')} onUpdateNode={vi.fn()} onClose={onClose} />,
    )
    expect(screen.getAllByRole('heading', { name: 'E-mail' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Assunto')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Fechar'))
    expect(onClose).toHaveBeenCalled()
  })
})
