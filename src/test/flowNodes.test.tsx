import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider, type NodeProps } from '@xyflow/react'
import {
  StartNode,
  CheckoutNode,
  UpsellNode,
  ThankYouNode,
  EmailNode,
  ConditionNode,
  WebhookNode,
} from '@/components/flow-builder/nodes'

function propsFor(label: string, selected = false, data: Record<string, unknown> = {}): NodeProps {
  return {
    id: 'test-node',
    type: 'test',
    position: { x: 0, y: 0 },
    data: { label, ...data },
    selected,
    selectable: true,
    deletable: true,
    draggable: true,
    zIndex: 0,
    isConnectable: true,
    parentId: undefined,
  } as unknown as NodeProps
}

function renderNode(ui: React.ReactElement) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>)
}

const CASES: Array<{
  name: string
  label: string
  element: (selected: boolean) => React.ReactElement
  handles: number
  accent: string
}> = [
  {
    name: 'start',
    label: 'Início',
    element: (s) => <StartNode {...propsFor('Início', s)} />,
    handles: 1,
    accent: '#01b274',
  },
  {
    name: 'checkout',
    label: 'Checkout',
    element: (s) => <CheckoutNode {...propsFor('Checkout', s)} />,
    handles: 2,
    accent: '#3b82f6',
  },
  {
    name: 'upsell',
    label: 'Upsell',
    element: (s) => <UpsellNode {...propsFor('Upsell', s)} />,
    handles: 2,
    accent: '#f59e0b',
  },
  {
    name: 'thank-you',
    label: 'Obrigado',
    element: (s) => <ThankYouNode {...propsFor('Obrigado', s)} />,
    handles: 1,
    accent: '#01b274',
  },
  {
    name: 'email',
    label: 'E-mail',
    element: (s) => <EmailNode {...propsFor('E-mail', s)} />,
    handles: 2,
    accent: '#8b5cf6',
  },
  {
    name: 'condition',
    label: 'Regra',
    element: (s) => <ConditionNode {...propsFor('Regra', s)} />,
    handles: 3,
    accent: '#ec4899',
  },
  {
    name: 'webhook',
    label: 'Hook',
    element: (s) => <WebhookNode {...propsFor('Hook', s)} />,
    handles: 2,
    accent: '#6366f1',
  },
]

describe('Flow nodes', () => {
  it.each(CASES.map((c) => [c.name, c] as const))(
    'nó %s renderiza label, legenda e handles no shell Evo',
    (_name, c) => {
      const { container } = renderNode(c.element(false))
      expect(screen.getByText(c.label)).toBeInTheDocument()
      expect(container.querySelectorAll('.react-flow__handle')).toHaveLength(c.handles)
      // Shell: card com fonte Inter semibold e legenda mono
      const root = screen.getByText(c.label).closest('div[data-selected], div.rounded-xl, div.rounded-full')
      expect(root?.getAttribute('class')).toContain('bg-card')
      expect(root?.getAttribute('class')).toContain('font-sans')
      expect(screen.getByText(c.label).getAttribute('class')).toContain('font-semibold')
    },
  )

  it.each(CASES.map((c) => [c.name, c] as const))(
    'nó %s selecionado usa a cor de acento do tipo',
    (_name, c) => {
      const { container } = renderNode(c.element(true))
      const root = container.querySelector('[data-selected="true"]')
      expect(root).not.toBeNull()
      expect(root?.getAttribute('style')).toContain(c.accent)
    },
  )

  it('condition tem saídas yes/no', () => {
    const { container } = renderNode(
      <ConditionNode {...propsFor('Regra')} />,
    )
    const handles = container.querySelectorAll('.react-flow__handle')
    const ids = Array.from(handles).map((h) => h.getAttribute('data-handleid'))
    expect(ids).toContain('yes')
    expect(ids).toContain('no')
  })

  it('webhook mostra selo do método e host da URL', () => {
    renderNode(
      <WebhookNode {...propsFor('Hook', false, { method: 'GET', url: 'https://api.exemplo.com/hook' })} />,
    )
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('api.exemplo.com')).toBeInTheDocument()
  })

  it('start em formato pílula mostra o gatilho', () => {
    const { container } = renderNode(
      <StartNode {...propsFor('Início', false, { trigger: 'manual' })} />,
    )
    expect(screen.getByText('manual')).toBeInTheDocument()
    expect(container.querySelector('.rounded-full')).not.toBeNull()
  })
})
