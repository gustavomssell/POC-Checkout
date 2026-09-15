import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Play } from 'lucide-react'

export function StartNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-full border-2 bg-green-50 font-medium text-sm text-slate-900
        ${selected ? 'border-green-500 shadow-lg' : 'border-green-200'}
        transition-all duration-200
      `}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Play className="w-3 h-3 text-white fill-white" />
        </div>
        <span>{(data as { label: string }).label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  )
}
