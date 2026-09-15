import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Edge } from '@xyflow/react'
import { CutButton, DeletableEdge } from '@/components/flow-builder/DeletableEdge'
import { flowEdgeTypes, removeEdgeById } from '@/components/flow-builder/flow-edges'
import { NodePalette } from '@/components/flow-builder/NodePalette'

const EDGES: Edge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
]

describe('Cortar ligação', () => {
  it('registra o tipo de aresta deletable no canvas', () => {
    expect(flowEdgeTypes.deletable).toBe(DeletableEdge)
  })

  it('remove só a aresta cortada', () => {
    expect(removeEdgeById(EDGES, 'e1').map((e) => e.id)).toEqual(['e2'])
  })

  it('id inexistente mantém todas as arestas', () => {
    expect(removeEdgeById(EDGES, 'nope')).toHaveLength(2)
  })
})

describe('CutButton: fixa no centro, sem pular', () => {
  const base = {
    x: 120,
    y: 80,
    edgeId: 'e1',
    onEnter: () => {},
    onLeave: () => {},
    onCut: () => {},
  }

  it('posição via left/top com translate constante de centralização', () => {
    render(<CutButton {...base} visible />)
    const button = screen.getByTitle('Cortar ligação')
    expect(button).toHaveStyle({ left: '120px', top: '80px', transform: 'translate(-50%, -50%)' })
  })

  it('anima só a opacidade (nunca posição/escala)', () => {
    render(<CutButton {...base} visible />)
    const button = screen.getByTitle('Cortar ligação')
    expect(button.className).toContain('transition-opacity')
    expect(button.className).not.toContain('transition-all')
    expect(button.className).not.toContain('scale-')
  })

  it('visibilidade alterna opacidade, clique e foco', () => {
    const onCut = vi.fn()
    const { rerender } = render(<CutButton {...base} visible={false} onCut={onCut} />)
    const button = screen.getByTitle('Cortar ligação')
    expect(button).toHaveStyle({ opacity: '0', pointerEvents: 'none' })
    expect(button).toHaveAttribute('tabindex', '-1')

    rerender(<CutButton {...base} visible onCut={onCut} />)
    expect(button).toHaveStyle({ opacity: '1', pointerEvents: 'all' })
    expect(button).toHaveAttribute('tabindex', '0')

    fireEvent.click(button)
    expect(onCut).toHaveBeenCalledTimes(1)
  })
})

describe('NodePalette: só arrastar-e-soltar', () => {
  it('orienta a arrastar e os itens são arrastáveis', () => {
    render(<NodePalette />)
    expect(screen.getByText(/Arraste para o canvas/)).toBeInTheDocument()

    const webhook = screen.getByRole('button', { name: /Webhook/ })
    expect(webhook).toHaveAttribute('draggable', 'true')
  })

  it('clicar num item não adiciona nó (sem handler de clique)', () => {
    const { container } = render(<NodePalette />)
    // A paleta não recebe mais onAddNode: clique é inócuo, só o drag cria nós.
    fireEvent.click(screen.getByRole('button', { name: /Webhook/ }))
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(0)
  })
})
