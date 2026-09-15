import { Position, type NodeProps } from '@xyflow/react'
import { Play } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'

const TRIGGER_LABELS: Record<string, string> = {
  checkout_created: 'pedido criado',
  checkout_opened: 'checkout aberto',
  payment_approved: 'pagamento aprovado',
  manual: 'manual',
}

export function StartNode({ data, selected }: NodeProps) {
  const d = data as { label: string; trigger?: string }
  return (
    <FlowNodeShell
      color="#01b274"
      icon={Play}
      label={d.label}
      caption={TRIGGER_LABELS[d.trigger ?? ''] ?? 'pedido criado'}
      selected={selected}
      pill
      handles={[{ type: 'source', position: Position.Bottom }]}
    />
  )
}
