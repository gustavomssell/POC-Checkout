import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type FlowNode,
  type FlowEdge,
  type FlowTemplate,
} from '@/types/flow'
import { generateId } from '@/lib/utils'

interface FlowState {
  templates: FlowTemplate[]
  currentTemplate: FlowTemplate | null
  selectedNodeId: string | null

  createTemplate: (name: string, description: string) => string
  updateTemplate: (id: string, updates: Partial<FlowTemplate>) => void
  deleteTemplate: (id: string) => void
  loadTemplate: (id: string) => void

  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  addNode: (node: FlowNode) => void
  updateNode: (id: string, updates: Partial<FlowNode>) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      templates: [],
      currentTemplate: null,
      selectedNodeId: null,

      createTemplate: (name, description) => {
        const id = generateId()
        const newTemplate: FlowTemplate = {
          id,
          name,
          description,
          nodes: [],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          templates: [...state.templates, newTemplate],
          currentTemplate: newTemplate,
        }))
        return id
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
          currentTemplate:
            state.currentTemplate?.id === id
              ? { ...state.currentTemplate, ...updates, updatedAt: new Date().toISOString() }
              : state.currentTemplate,
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          currentTemplate:
            state.currentTemplate?.id === id ? null : state.currentTemplate,
        }))
      },

      loadTemplate: (id) => {
        const { templates } = get()
        const template = templates.find((t) => t.id === id)
        if (template) {
          set({ currentTemplate: template, selectedNodeId: null })
        }
      },

      setNodes: (nodes) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        get().updateTemplate(currentTemplate.id, { nodes })
      },

      setEdges: (edges) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        get().updateTemplate(currentTemplate.id, { edges })
      },

      addNode: (node) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        get().updateTemplate(currentTemplate.id, {
          nodes: [...currentTemplate.nodes, node],
        })
      },

      updateNode: (id, updates) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const updatedNodes = currentTemplate.nodes.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        )
        get().updateTemplate(currentTemplate.id, { nodes: updatedNodes })
      },

      removeNode: (id) => {
        const { currentTemplate, selectedNodeId } = get()
        if (!currentTemplate) return

        const updatedNodes = currentTemplate.nodes.filter((n) => n.id !== id)
        const updatedEdges = currentTemplate.edges.filter(
          (e) => e.source !== id && e.target !== id
        )

        get().updateTemplate(currentTemplate.id, {
          nodes: updatedNodes,
          edges: updatedEdges,
        })

        if (selectedNodeId === id) {
          set({ selectedNodeId: null })
        }
      },

      selectNode: (id) => {
        set({ selectedNodeId: id })
      },
    }),
    {
      name: 'flow-storage',
    }
  )
)
