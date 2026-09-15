import { Minus, Plus, Star, Trash2, type LucideIcon } from 'lucide-react'
import { Input } from './input'
import { Label } from './label'
import { Switch } from './switch'
import { cn } from '@/lib/utils'

/* ---------------------------------- Field --------------------------------- */

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

/** Rótulo + controle + dica opcional. */
export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* --------------------------------- Section -------------------------------- */

interface SectionProps {
  icon: LucideIcon
  title: string
  hint?: string
  children: React.ReactNode
}

/** Agrupamento com ícone, título e dica. */
export function Section({ icon: Icon, title, hint, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-semibold leading-tight">{title}</h3>
          {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

/* -------------------------------- ToggleRow ------------------------------- */

interface ToggleRowProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Linha com Switch à direita. */
export function ToggleRow({ label, hint, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <div className="min-w-0">
        <p className="text-xs font-medium">{label}</p>
        {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" />
    </div>
  )
}

/* -------------------------------- Segmented ------------------------------- */

interface SegmentedProps<T extends string> {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}

/** Controle segmentado (pílulas) para poucas opções. */
export function Segmented<T extends string>({ options, value, onChange, ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="grid gap-1 p-1 rounded-lg bg-muted"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'px-2 py-1.5 rounded-md text-xs font-medium transition-colors truncate',
            value === option.value
              ? 'bg-card shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------- StarRating ------------------------------ */

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
}

/** Avaliação por estrelas clicáveis. */
export function StarRating({ value, onChange }: StarRatingProps) {
  const current = Math.min(5, Math.max(1, Math.round(value) || 1))
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          title={`${star} estrela${star > 1 ? 's' : ''}`}
          aria-label={`${star} de 5 estrelas`}
          className="p-0.5 rounded hover:scale-110 transition-transform"
        >
          <Star
            className={cn(
              'w-6 h-6',
              star <= current ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
            )}
          />
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-1.5">{current}/5</span>
    </div>
  )
}

/* ------------------------------- NumberStepper ---------------------------- */

interface NumberStepperProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  ariaLabel?: string
}

/** Seletor numérico com botões - e +. */
export function NumberStepper({ value, min = 0, max = 99, step = 1, onChange, ariaLabel }: NumberStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number.isNaN(v) ? min : v))
  return (
    <div className="flex items-center gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        aria-label="Diminuir"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
        className="h-8 w-8 shrink-0 rounded-md border bg-background flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <Input
        type="number"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value)))}
        className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Aumentar"
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
        className="h-8 w-8 shrink-0 rounded-md border bg-background flex items-center justify-center hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/* --------------------------------- ItemCard ------------------------------- */

interface ItemCardProps {
  title: string
  onRemove: () => void
  children: React.ReactNode
}

/** Cartão de item de lista (garantias, benefícios, FAQ). */
export function ItemCard({ title, onRemove, children }: ItemCardProps) {
  return (
    <div className="p-3 bg-background rounded-lg border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{title}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-destructive hover:underline"
        >
          <Trash2 className="w-3 h-3" />
          Remover
        </button>
      </div>
      {children}
    </div>
  )
}

/* -------------------------------- AddButton ------------------------------- */

interface AddButtonProps {
  label: string
  onClick: () => void
}

/** Botão tracejado para adicionar item à lista. */
export function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-8 border border-dashed rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      + {label}
    </button>
  )
}
