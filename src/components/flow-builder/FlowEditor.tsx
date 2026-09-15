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
import { flowEdgeTypes } from './flow-edges'
import { FLOW_NODE_TYPES } from '@/lib/constants'
import type { FlowNode, FlowEdge } from '@/types/flow'

export const FLOW_NODE_MIME = 'application/flow-node'

interface FlowEditorProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  onNodesChange: OnNodesChange<FlowNode>
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  /** Clique simples: só seleciona (destaque + excluir). */
  onNodeSelect: (id: string | null) => void
  /** Duplo clique: abre o modal de propriedades. */
  onNodeEdit: (id: string) => void
  onDropNode: (type: string, position: { x: number; y: number }) => void
}

export function FlowEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onNodeEdit,
  onDropNode,
}: FlowEditorProps) {
  const { screenToFlowPosition } = useReactFlow()

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onNodeSelect(node.id)
    },
    [onNodeSelect]
  )

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      onNodeEdit(node.id)
    },
    [onNodeEdit]
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
  const edgeTypesConfig = useMemo(() => flowEdgeTypes, [])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypesConfig}
        edgeTypes={edgeTypesConfig}
        fitView
        className="bg-background"
        defaultEdgeOptions={{ type: 'deletable', animated: true, style: { stroke: '#01b274', strokeWidth: 2 } }}
      >
        <Controls className="flow-controls" />
        <MiniMap
          className="flow-minimap"
          nodeColor={(node) => {
            const typeConfig = FLOW_NODE_TYPES.find((t) => t.type === node.type)
            return typeConfig?.color || '#94a3b8'
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="currentColor" className="!text-[#01b274]/25 dark:!text-[#00ffa7]/15" />
      </ReactFlow>
    </div>
  )
}
