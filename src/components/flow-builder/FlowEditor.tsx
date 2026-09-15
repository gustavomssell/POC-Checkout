import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useReactFlow,
  BackgroundVariant,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './nodes'
import { FLOW_NODE_TYPES } from '@/lib/constants'
import type { FlowNode, FlowEdge } from '@/types/flow'

export const FLOW_NODE_MIME = 'application/flow-node'

interface FlowEditorProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  onNodesChange: OnNodesChange<FlowNode>
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  onNodeSelect: (id: string | null) => void
  onDropNode: (type: string, position: { x: number; y: number }) => void
}

export function FlowEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onDropNode,
}: FlowEditorProps) {
  const { screenToFlowPosition } = useReactFlow()

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onNodeSelect(node.id)
    },
    [onNodeSelect]
  )

  const onPaneClick = useCallback(
    () => {
      onNodeSelect(null)
    },
    [onNodeSelect]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData(FLOW_NODE_MIME)
      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      onDropNode(type, position)
    },
    [screenToFlowPosition, onDropNode]
  )

  const nodeTypesConfig = useMemo(() => nodeTypes, [])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypesConfig}
        fitView
        className="bg-background"
      >
        <Controls className="!bg-card !border !rounded-lg !shadow-lg" />
        <MiniMap
          className="!bg-card !border !rounded-lg !shadow-lg"
          nodeColor={(node) => {
            const typeConfig = FLOW_NODE_TYPES.find((t) => t.type === node.type)
            return typeConfig?.color || '#94a3b8'
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="currentColor" className="!text-muted-foreground/30" />
      </ReactFlow>
    </div>
  )
}
