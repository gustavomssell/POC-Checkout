import { GripVertical } from 'lucide-react'
import { FLOW_NODE_TYPES } from '@/lib/constants'
import { FLOW_NODE_MIME } from './FlowEditor'

interface NodePaletteProps {
  onAddNode: (type: string) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-56 border-r bg-sidebar flex flex-col hidden md:flex">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold">Nós</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste ou clique para adicionar
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {FLOW_NODE_TYPES.map((nodeType) => (
          <button
            key={nodeType.type}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(FLOW_NODE_MIME, nodeType.type)
              event.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => onAddNode(nodeType.type)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 hover:bg-accent transition-colors text-left"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${nodeType.color}20` }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: nodeType.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{nodeType.name}</p>
              <p className="text-xs text-muted-foreground truncate">{nodeType.description}</p>
            </div>
            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
          </button>
        ))}
      </div>
    </div>
  )
}
