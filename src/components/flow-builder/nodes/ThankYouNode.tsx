import { Handle, Position, type NodeProps } from '@xyflow/react'
import { CheckCircle } from 'lucide-react'

export function ThankYouNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-xl border-2 bg-emerald-50 font-medium text-sm text-slate-900 min-w-[140px]
        ${selected ? 'border-emerald-500 shadow-lg' : 'border-emerald-200'}
        transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
        <span>{(data as { label: string }).label}</span>
      </div>
    </div>
  )
}
