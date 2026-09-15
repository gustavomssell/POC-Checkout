import { Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'

export function ConditionNode({ data, selected }: NodeProps) {
  const d = data as {
    label: string
    mode?: string
    field?: string
    operator?: string
    value?: string
    condition?: string
  }
  const caption =
    d.mode === 'advanced'
      ? d.condition || 'expressão…'
      : `${d.field || 'campo'} ${d.operator || '=='} ${d.operator === 'exists' ? '' : (d.value || '…')}`.trim()
  return (
    <FlowNodeShell
      color="#ec4899"
      icon={GitBranch}
      label={d.label}
      caption={caption}
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom, id: 'yes', title: 'Sim', style: { left: '30%' } },
        { type: 'source', position: Position.Bottom, id: 'no', title: 'Não', style: { left: '70%' } },
      ]}
    />
  )
}
