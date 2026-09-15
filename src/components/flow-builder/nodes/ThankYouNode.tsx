import { Position, type NodeProps } from '@xyflow/react'
import { CheckCircle } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'

export function ThankYouNode({ data, selected }: NodeProps) {
  const d = data as { label: string; headline?: string }
  return (
    <FlowNodeShell
      color="#01b274"
      icon={CheckCircle}
      label={d.label}
      caption={d.headline || 'confirmação'}
      selected={selected}
      handles={[{ type: 'target', position: Position.Top }]}
    />
  )
}
