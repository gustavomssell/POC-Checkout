import { Position, type NodeProps } from '@xyflow/react'
import { Mail } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'

export function EmailNode({ data, selected }: NodeProps) {
  const d = data as { label: string; subject?: string; template?: string; delayMinutes?: number }
  const delay = typeof d.delayMinutes === 'number' && d.delayMinutes > 0 ? ` · +${d.delayMinutes}min` : ''
  return (
    <FlowNodeShell
      color="#8b5cf6"
      icon={Mail}
      label={d.label}
      caption={`${d.subject || d.template || 'enviar e-mail'}${delay}`}
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom },
      ]}
    />
  )
}
