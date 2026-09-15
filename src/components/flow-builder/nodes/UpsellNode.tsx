import { Position, type NodeProps } from '@xyflow/react'
import { Sparkles } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'

export function UpsellNode({ data, selected }: NodeProps) {
  const d = data as { label: string; productName?: string; price?: number }
  const price = typeof d.price === 'number' ? ` · R$ ${d.price.toFixed(0)}` : ''
  return (
    <FlowNodeShell
      color="#f59e0b"
      icon={Sparkles}
      label={d.label}
      caption={`${d.productName || 'oferta adicional'}${price}`}
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom },
      ]}
    />
  )
}
