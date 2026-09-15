import { describe, it, expect, beforeEach } from 'vitest'
import { useFlowStore } from '@/stores/flowStore'
import type { FlowNode } from '@/types/flow'

function resetStore() {
  useFlowStore.setState({
    templates: [],
    currentTemplate: null,
    selectedNodeId: null,
  })
}

function makeNode(id: string, type: FlowNode['type'] = 'checkout'): FlowNode {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: { label: id, type },
  }
}

describe('FlowStore', () => {
  beforeEach(resetStore)

  it('cria template vazio', () => {
    const { createTemplate } = useFlowStore.getState()
    const id = createTemplate('Meu Flow', 'desc')

    const { templates, currentTemplate } = useFlowStore.getState()
    expect(templates).toHaveLength(1)
    expect(currentTemplate?.id).toBe(id)
    expect(currentTemplate?.nodes).toEqual([])
    expect(currentTemplate?.edges).toEqual([])
  })

  it('adiciona e atualiza nós', () => {
    const { createTemplate, addNode, updateNode } = useFlowStore.getState()
    createTemplate('F', '')

    addNode(makeNode('n1'))
    updateNode('n1', { data: { label: 'Novo', type: 'checkout' } })

    const nodes = useFlowStore.getState().currentTemplate?.nodes || []
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.label).toBe('Novo')
  })

  it('remove nó junto com as arestas conectadas', () => {
    const { createTemplate, addNode, updateTemplate, removeNode } = useFlowStore.getState()
    createTemplate('F', '')
    addNode(makeNode('n1'))
    addNode(makeNode('n2'))
    updateTemplate(useFlowStore.getState().currentTemplate!.id, {
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    })

    removeNode('n1')

    const t = useFlowStore.getState().currentTemplate
    expect(t?.nodes.map((n) => n.id)).toEqual(['n2'])
    expect(t?.edges).toHaveLength(0)
  })

  it('setNodes/setEdges persistem no template', () => {
    const { createTemplate, setNodes, setEdges } = useFlowStore.getState()
    createTemplate('F', '')

    setNodes([makeNode('a'), makeNode('b', 'email')])
    setEdges([{ id: 'e', source: 'a', target: 'b' }])

    const t = useFlowStore.getState().currentTemplate
    expect(t?.nodes).toHaveLength(2)
    expect(t?.edges).toHaveLength(1)
  })

  it('seleciona nó e limpa ao remover', () => {
    const { createTemplate, addNode, selectNode, removeNode } = useFlowStore.getState()
    createTemplate('F', '')
    addNode(makeNode('n1'))

    selectNode('n1')
    expect(useFlowStore.getState().selectedNodeId).toBe('n1')

    removeNode('n1')
    expect(useFlowStore.getState().selectedNodeId).toBeNull()
  })

  it('loadTemplate carrega por id e ignora id inválido', () => {
    const { createTemplate, loadTemplate } = useFlowStore.getState()
    const id = createTemplate('F', '')

    loadTemplate('inexistente')
    expect(useFlowStore.getState().currentTemplate?.id).toBe(id)

    useFlowStore.setState({ currentTemplate: null })
    loadTemplate(id)
    expect(useFlowStore.getState().currentTemplate?.id).toBe(id)
  })

  it('deleta template', () => {
    const { createTemplate, deleteTemplate } = useFlowStore.getState()
    const id = createTemplate('F', '')
    deleteTemplate(id)

    expect(useFlowStore.getState().templates).toHaveLength(0)
    expect(useFlowStore.getState().currentTemplate).toBeNull()
  })
})
