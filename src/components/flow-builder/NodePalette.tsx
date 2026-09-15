import { GripVertical } from 'lucide-react'
import { FLOW_NODE_TYPES } from '@/lib/constants'
import { FLOW_NODE_MIME } from './FlowEditor'
import { FLOW_NODE_ICONS } from './nodes'
import type { FlowNodeType } from '@/types/flow'

export function NodePalette() {
  return (
    <div className="w-60 border-r border-border bg-sidebar flex flex-col hidden md:flex">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Nós</h2>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">
            {FLOW_NODE_TYPES.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste para o canvas para adicionar
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {FLOW_NODE_TYPES.map((nodeType) => {
          const Icon = FLOW_NODE_ICONS[nodeType.type as FlowNodeType] ?? GripVertical
          return (
            <button
              key={nodeType.type}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(FLOW_NODE_MIME, nodeType.type)
                event.dataTransfer.effectAllowed = 'move'
              }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card text-left transition-all duration-150 hover:-translate-y-px hover:shadow-node hover:border-[#01b274]/60 cursor-grab active:cursor-grabbing"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${nodeType.color}1f` }}
              >
                <Icon className="w-4 h-4" style={{ color: nodeType.color }} strokeWidth={2.25} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold tracking-tight truncate">{nodeType.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{nodeType.description}</p>
              </div>
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
