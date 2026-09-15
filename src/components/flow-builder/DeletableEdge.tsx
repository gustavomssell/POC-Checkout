import { useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import { Scissors } from 'lucide-react'
import { removeEdgeById } from './flow-edges'

interface CutButtonProps {
  x: number
  y: number
  visible: boolean
  edgeId: string
  onEnter: () => void
  onLeave: () => void
  onCut: (event: React.MouseEvent) => void
}

/**
 * Tesoura fixa no centro da ligação: posição via left/top com translate
 * constante e transição SÓ de opacidade (nunca anima posição/escala).
 */
export function CutButton({ x, y, visible, edgeId, onEnter, onLeave, onCut }: CutButtonProps) {
  return (
    <button
      type="button"
      title="Cortar ligação"
      aria-label="Cortar ligação"
      data-edge-cut={edgeId}
      tabIndex={visible ? 0 : -1}
      onClick={onCut}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="nodrag nopan absolute w-7 h-7 rounded-full border border-border bg-card text-muted-foreground shadow-node flex items-center justify-center transition-opacity duration-150 hover:text-destructive hover:border-destructive/50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      <Scissors className="w-3.5 h-3.5" />
    </button>
  )
}

/**
 * Ligação com botão de "cortar": a tesoura fica fixa no centro da linha
 * e só aparece enquanto o mouse está sobre a linha (ou o próprio botão).
 * Sem transição de posição/escala para não "pular".
 */
export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const [hover, setHover] = useState(false)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Ao sair da linha em direção ao botão, mantém visível (evita o pisca-pisca).
  const handleLineLeave = (event: React.MouseEvent) => {
    const target = event.relatedTarget as Element | null
    if (target?.closest?.(`[data-edge-cut="${id}"]`)) return
    setHover(false)
  }

  const cut = (event: React.MouseEvent | React.SyntheticEvent) => {
    event.stopPropagation()
    setEdges((edges) => removeEdgeById(edges, id))
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {/* Área de hover generosa (invisível) ao longo da linha */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={handleLineLeave}
      />
      <EdgeLabelRenderer>
        <CutButton
          x={labelX}
          y={labelY}
          visible={hover}
          edgeId={id}
          onEnter={() => setHover(true)}
          onLeave={() => setHover(false)}
          onCut={cut}
        />
      </EdgeLabelRenderer>
    </>
  )
}
