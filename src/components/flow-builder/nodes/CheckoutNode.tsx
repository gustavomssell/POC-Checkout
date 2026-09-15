import { Position, type NodeProps } from '@xyflow/react'
import { ShoppingCart } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'

export function CheckoutNode({ data, selected }: NodeProps) {
  const d = data as { label: string; checkoutId?: string; redirectUrl?: string }
  const caption = d.checkoutId || shortHost(d.redirectUrl) || 'página de venda'
  return (
    <FlowNodeShell
      color="#3b82f6"
      icon={ShoppingCart}
      label={d.label}
      caption={caption}
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom },
      ]}
    />
  )
}

function shortHost(url?: string): string {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').split('/')[0].slice(0, 26)
}
