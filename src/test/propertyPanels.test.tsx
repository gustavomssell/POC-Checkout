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

function flowNode(type: string, data: Record<string, unknown> = {}): Node {
  return {
    id: 'node-1',
    type,
    position: { x: 0, y: 0 },
    data: { label: 'Nó', type, ...data },
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

  it('condition simples mostra construtor e avança para expressão', () => {
    const onUpdate = vi.fn()
    const { rerender } = render(
      <FlowPropertyPanel selectedNode={flowNode('condition')} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    // Modo simples por padrão: campo + operador + valor com preview
    expect(screen.getByLabelText('Campo da condição')).toBeInTheDocument()
    expect(screen.getByLabelText('Operador da condição')).toBeInTheDocument()
    expect(screen.getByText(/saída verde/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Avançada' }))
    expect(onUpdate).toHaveBeenCalledWith('node-1', { mode: 'advanced' })

    rerender(
      <FlowPropertyPanel selectedNode={flowNode('condition', { mode: 'advanced' })} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText('Ex: pagamento_aprovado == true')).toBeInTheDocument()
  })

  it('condition simples deriva a expressão ao trocar o campo', () => {
    const onUpdate = vi.fn()
    render(
      <FlowPropertyPanel selectedNode={flowNode('condition')} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    fireEvent.change(screen.getByLabelText('Operador da condição'), { target: { value: '>' } })
    expect(onUpdate).toHaveBeenCalledWith(
      'node-1',
      expect.objectContaining({ operator: '>', condition: expect.stringContaining('>') }),
    )
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

describe('FlowPropertyPanel: campos por tipo de nó', () => {
  it('start mostra o gatilho de disparo', () => {
    const onUpdate = vi.fn()
    render(
      <FlowPropertyPanel selectedNode={flowNode('start')} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    const trigger = screen.getByLabelText('Evento de disparo')
    fireEvent.change(trigger, { target: { value: 'manual' } })
    expect(onUpdate).toHaveBeenCalledWith('node-1', { trigger: 'manual' })
  })

  it('checkout mostra ação de conclusão e redirecionamento', () => {
    render(
      <FlowPropertyPanel selectedNode={flowNode('checkout')} onUpdateNode={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText('checkout-principal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redirecionar' })).toBeInTheDocument()
  })

  it('upsell mostra oferta e permite pular', () => {
    const onUpdate = vi.fn()
    render(
      <FlowPropertyPanel selectedNode={flowNode('upsell')} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Oferta')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('switch', { name: 'Permitir pular' }))
    expect(onUpdate).toHaveBeenCalledWith('node-1', { allowSkip: expect.any(Boolean) })
  })

  it('thank-you mostra resumo e cupom', () => {
    render(
      <FlowPropertyPanel selectedNode={flowNode('thank-you')} onUpdateNode={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Mostrar resumo do pedido')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('VOLTE10')).toBeInTheDocument()
  })

  it('email fixo revela o campo de e-mail; cliente esconde', () => {
    const onUpdate = vi.fn()
    const { rerender } = render(
      <FlowPropertyPanel selectedNode={flowNode('email')} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    expect(screen.queryByPlaceholderText('time@exemplo.com')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fixo' }))
    expect(onUpdate).toHaveBeenCalledWith('node-1', { toMode: 'fixed' })

    rerender(
      <FlowPropertyPanel selectedNode={flowNode('email', { toMode: 'fixed' })} onUpdateNode={onUpdate} onClose={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText('time@exemplo.com')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Atraso em minutos' })).toBeInTheDocument()
  })

  it('webhook POST mostra corpo e esconde query params', () => {
    render(
      <FlowPropertyPanel selectedNode={flowNode('webhook', { method: 'POST' })} onUpdateNode={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByLabelText('Corpo JSON')).toBeInTheDocument()
    expect(screen.queryByText('Query params')).not.toBeInTheDocument()
  })

  it('webhook GET mostra query params e esconde o corpo', () => {
    render(
      <FlowPropertyPanel selectedNode={flowNode('webhook', { method: 'GET' })} onUpdateNode={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Query params')).toBeInTheDocument()
    expect(screen.queryByLabelText('Corpo JSON')).not.toBeInTheDocument()
    expect(screen.getByText(/não envia corpo/)).toBeInTheDocument()
  })

  it('webhook avisa URL sem https e JSON inválido', () => {
    render(
      <FlowPropertyPanel
        selectedNode={flowNode('webhook', { method: 'POST', url: 'http://inseguro.com', body: '{invalido' })}
        onUpdateNode={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText(/precisa começar com https/)).toBeInTheDocument()
    expect(screen.getByText(/JSON inválido/)).toBeInTheDocument()
  })

  it('webhook permite adicionar headers', () => {
    const onUpdate = vi.fn()
    render(
      <FlowPropertyPanel
        selectedNode={flowNode('webhook', { method: 'POST', headers: [] })}
        onUpdateNode={onUpdate}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '+ Adicionar header' }))
    expect(onUpdate).toHaveBeenCalledWith('node-1', { headers: [{ key: '', value: '' }] })
  })
})
