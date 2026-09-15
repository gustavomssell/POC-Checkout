import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'

export function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-xl border-2 bg-pink-50 font-medium text-sm text-slate-900 min-w-[140px]
        ${selected ? 'border-pink-500 shadow-lg' : 'border-pink-200'}
        transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-pink-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <span>{(data as { label: string }).label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '30%' }}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '70%' }}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  )
}
