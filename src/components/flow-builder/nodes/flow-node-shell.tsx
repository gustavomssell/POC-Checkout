import { Handle, Position, type HandleType } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FlowHandleSpec {
  type: HandleType
  position: Position
  id?: string
  style?: React.CSSProperties
  title?: string
  /** Cor do handle. Padrão: cor do tipo. yes/no usam verde/vermelho. */
  color?: string
}

interface FlowNodeShellProps {
  color: string
  icon: LucideIcon
  label: string
  /** Linha secundária (mono, truncada). Ex: método do webhook, expressão da condição. */
  caption?: React.ReactNode
  selected?: boolean
  handles: FlowHandleSpec[]
  /** Nó de início usa o formato pílula. */
  pill?: boolean
  children?: React.ReactNode
}

function resolveHandleColor(spec: FlowHandleSpec, fallback: string): string {
  if (spec.color) return spec.color
  if (spec.id === 'yes') return '#22c55e'
  if (spec.id === 'no') return '#ef4444'
  return fallback
}

/**
 * Moldura única dos nós do flow (identidade Evolution Foundation):
 * card claro/escuro, barra de acento na cor do tipo, chip de ícone,
 * tipografia Inter semibold + legenda mono, sombra suave em camadas.
 */
export function FlowNodeShell({
  color,
  icon: Icon,
  label,
  caption,
  selected,
  handles,
  pill,
  children,
}: FlowNodeShellProps) {
  return (
    <div
      data-selected={selected ? 'true' : undefined}
      className={cn(
        'relative min-w-[172px] max-w-[248px] border bg-card font-sans text-card-foreground transition-all duration-200',
        pill ? 'rounded-full' : 'rounded-xl',
        selected ? 'shadow-panel' : 'shadow-node hover:shadow-panel',
      )}
      style={
        selected
          ? { borderColor: color, boxShadow: `0 0 0 2px ${color}40, 0 12px 32px -12px rgb(10 17 16 / 0.25)` }
          : { borderColor: 'var(--color-border)' }
      }
    >
      {/* Barra de acento na cor do tipo */}
      <span
        aria-hidden
        className="absolute top-2.5 bottom-2.5 w-1 rounded-full"
        style={{
          backgroundColor: color,
          left: pill ? 12 : 0,
          borderTopLeftRadius: pill ? undefined : 0,
          borderBottomLeftRadius: pill ? undefined : 0,
        }}
      />
      <div className={cn('flex items-center gap-2.5 py-3 pr-3.5', pill ? 'pl-7 pr-5' : 'pl-4')}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}1f` }}
        >
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight leading-tight truncate">{label}</p>
          {caption && (
            <p className="text-[11px] leading-tight text-muted-foreground font-mono truncate mt-0.5">
              {caption}
            </p>
          )}
        </div>
      </div>
      {children}
      {handles.map((h, i) => (
        <Handle
          key={`${h.type}-${h.position}-${h.id ?? i}`}
          type={h.type}
          position={h.position}
          id={h.id}
          title={h.title}
          style={{ backgroundColor: resolveHandleColor(h, color), ...h.style }}
          className="w-3 h-3 border-2 border-card"
        />
      ))}
    </div>
  )
}
