import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from '@xyflow/react'
import { ArrowLeft, Save, Trash2, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FlowEditor } from './FlowEditor'
import { FlowPropertiesDialog } from './FlowPropertyPanel'
import { NodePalette } from './NodePalette'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useFlowStore } from '@/stores/flowStore'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { useToast } from '@/components/ui/toast'
import { DEFAULT_FLOW_EDGES, DEFAULT_FLOW_NODES, FLOW_NODE_DEFAULT_DATA, FLOW_NODE_TYPES } from '@/lib/constants'
import type { FlowNode, FlowEdge, FlowNodeType } from '@/types/flow'

const VALID_NODE_TYPES: FlowNodeType[] = ['start', 'checkout', 'upsell', 'thank-you', 'email', 'condition', 'webhook']

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

interface FlowBuilderProps {
  onBack?: () => void
}

function FlowBuilderContent({ onBack }: FlowBuilderProps) {
  const { addToast } = useToast()
  const { currentTemplate, updateTemplate, createTemplate } = useFlowStore()
  const checkoutTemplate = useCheckoutStore((s) => s.currentTemplate)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(true)
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])
  const lastTemplateId = useRef<string | null>(null)

  // Garante que existe um template de flow: usa o mais recente ou cria com os nós padrão
  useEffect(() => {
    if (!currentTemplate) {
      const { templates, loadTemplate } = useFlowStore.getState()
      if (templates.length > 0) {
        loadTemplate(templates[templates.length - 1].id)
      } else {
        const name = checkoutTemplate ? `${checkoutTemplate.name} - Flow` : 'Novo Flow'
        const id = createTemplate(name, '')
        updateTemplate(id, { nodes: clone(DEFAULT_FLOW_NODES), edges: clone(DEFAULT_FLOW_EDGES) })
      }
    }
  }, [currentTemplate, checkoutTemplate, createTemplate, updateTemplate])

  // Sincroniza o canvas quando troca de template
  useEffect(() => {
    if (currentTemplate && currentTemplate.id !== lastTemplateId.current) {
      lastTemplateId.current = currentTemplate.id
      setNodes(currentTemplate.nodes)
      setEdges(currentTemplate.edges)
      setSelectedNodeId(null)
      setEditingNodeId(null)
    }
  }, [currentTemplate, setNodes, setEdges])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null
  const editingNode = nodes.find((n) => n.id === editingNodeId) ?? null

  const closeEditor = useCallback(() => setEditingNodeId(null), [])

  const handleAddNode = useCallback((type: string, position?: { x: number; y: number }) => {
    const validType: FlowNodeType = VALID_NODE_TYPES.includes(type as FlowNodeType)
      ? (type as FlowNodeType)
      : 'checkout'
    const nodeConfig = FLOW_NODE_TYPES.find((t) => t.type === validType)
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type: validType,
      position: position ?? { x: 250, y: nodes.length * 130 + 50 },
      data: {
        label: nodeConfig?.name ?? validType,
        type: validType,
        ...clone(FLOW_NODE_DEFAULT_DATA[validType]),
      },
    }
    setNodes((prev) => [...prev, newNode])
    setSelectedNodeId(newNode.id)
  }, [nodes.length, setNodes])

  const handleUpdateNode = useCallback((id: string, data: Record<string, unknown>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
    )
  }, [setNodes])

  const handleDeleteNode = useCallback(() => {
    if (selectedNodeId) {
      const id = selectedNodeId
      setNodes((prev) => prev.filter((n) => n.id !== id))
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id))
      setSelectedNodeId(null)
      setEditingNodeId((editing) => (editing === id ? null : editing))
    }
  }, [selectedNodeId, setNodes, setEdges])

  const handleConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#01b274', strokeWidth: 2 },
    }, eds))
  }, [setEdges])

  const handleSave = useCallback(() => {
    if (!currentTemplate) {
      addToast('error', 'Nenhum flow para salvar.')
      return
    }
    updateTemplate(currentTemplate.id, { nodes, edges })
    addToast('success', 'Flow salvo com sucesso!')
  }, [currentTemplate, nodes, edges, updateTemplate, addToast])

  return (
    <div className="flow-builder h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hidden md:flex"
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
        >
          {isPaletteOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold tracking-tight">Flow Builder</h1>
          <p className="text-xs text-muted-foreground">
            Configure o fluxo do checkout e pós-checkout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {selectedNode && (
            <Button variant="destructive" size="sm" onClick={handleDeleteNode}>
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-[#00ffa7] text-[#0a1110] font-semibold hover:bg-[#01b274] hover:text-white shadow-node"
          >
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Salvar</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        {isPaletteOpen && <NodePalette />}

        {/* Flow Editor */}
        <div className="flex-1">
          <FlowEditor
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeSelect={setSelectedNodeId}
            onNodeEdit={setEditingNodeId}
            onDropNode={handleAddNode}
          />
        </div>
      </div>

      {/* Node Properties Dialog (só abre com duplo clique no nó) */}
      <FlowPropertiesDialog
        selectedNode={editingNode}
        onUpdateNode={handleUpdateNode}
        onClose={closeEditor}
      />
    </div>
  )
}

export function FlowBuilder({ onBack }: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent onBack={onBack} />
    </ReactFlowProvider>
  )
}
