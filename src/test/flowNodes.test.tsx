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

function propsFor(label: string, selected = false): NodeProps {
  return {
    id: 'test-node',
    type: 'test',
    position: { x: 0, y: 0 },
    data: { label },
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
  selectedBorder: string
}> = [
  {
    name: 'start',
    label: 'Início',
    element: (s) => <StartNode {...propsFor('Início', s)} />,
    handles: 1,
    selectedBorder: 'border-green-500',
  },
  {
    name: 'checkout',
    label: 'Checkout',
    element: (s) => <CheckoutNode {...propsFor('Checkout', s)} />,
    handles: 2,
    selectedBorder: 'border-blue-500',
  },
  {
    name: 'upsell',
    label: 'Upsell',
    element: (s) => <UpsellNode {...propsFor('Upsell', s)} />,
    handles: 2,
    selectedBorder: 'border-amber-500',
  },
  {
    name: 'thank-you',
    label: 'Obrigado',
    element: (s) => <ThankYouNode {...propsFor('Obrigado', s)} />,
    handles: 1,
    selectedBorder: 'border-emerald-500',
  },
  {
    name: 'email',
    label: 'E-mail',
    element: (s) => <EmailNode {...propsFor('E-mail', s)} />,
    handles: 2,
    selectedBorder: 'border-violet-500',
  },
  {
    name: 'condition',
    label: 'Regra',
    element: (s) => <ConditionNode {...propsFor('Regra', s)} />,
    handles: 3,
    selectedBorder: 'border-pink-500',
  },
  {
    name: 'webhook',
    label: 'Hook',
    element: (s) => <WebhookNode {...propsFor('Hook', s)} />,
    handles: 2,
    selectedBorder: 'border-indigo-500',
  },
]

describe('Flow nodes', () => {
  it.each(CASES.map((c) => [c.name, c] as const))(
    'nó %s renderiza label, handles e texto legível no dark',
    (_name, c) => {
      const { container } = renderNode(c.element(false))
      expect(screen.getByText(c.label)).toBeInTheDocument()
      expect(container.querySelectorAll('.react-flow__handle')).toHaveLength(c.handles)
      // Texto escuro sobre fundo pastel (legível nos dois temas)
      const root = screen.getByText(c.label).closest('div[class*="rounded"]')
      expect(root?.getAttribute('class')).toContain('text-slate-900')
    },
  )

  it.each(CASES.map((c) => [c.name, c] as const))(
    'nó %s selecionado destaca a borda',
    (_name, c) => {
      const { container } = renderNode(c.element(true))
      expect(container.innerHTML).toContain(c.selectedBorder)
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
})
