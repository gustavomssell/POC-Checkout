import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  defaultKeyboardCoordinateGetter,
  type KeyboardCoordinateGetter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/sortable'
import { ArrowLeft, Save, Eye, PanelLeftClose, PanelLeft, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'
import { ComponentPalette } from './ComponentPalette'
import { Canvas } from './Canvas'
import { ComponentPropertiesDialog } from './PropertyPanel'
import { BackgroundSettings } from './BackgroundSettings'
import { CheckoutComponentRenderer } from './CheckoutComponentRenderer'
import { PreviewContainer } from '@/components/preview'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useToast } from '@/components/ui/toast'
import type { ComponentType, CheckoutComponent, ComponentPlacement } from '@/types/checkout'

interface CheckoutEditorProps {
  onBack?: () => void
}

export interface ActiveDrag {
  id: string
  componentType?: ComponentType
  component?: CheckoutComponent
}

/**
 * Resolve o componente exibido no overlay durante o arrasto, qualquer que
 * seja a origem: item do canvas (busca na lista), item aninhado (vem nos
 * dados do drag) ou item da paleta (montado com os defaults do catálogo).
 */
export function resolveOverlayComponent(
  activeDrag: ActiveDrag | null,
  components: CheckoutComponent[],
): CheckoutComponent | null {
  if (!activeDrag) return null
  if (activeDrag.component) return activeDrag.component
  if (activeDrag.componentType) {
    const config = CHECKOUT_COMPONENTS.find((c) => c.type === activeDrag.componentType)
    if (!config) return null
    return {
      id: `preview-${config.type}`,
      type: config.type,
      props: JSON.parse(JSON.stringify(config.defaultProps)),
      order: 0,
      gridColumns: config.gridColumns,
      children: config.isGrid ? [] : undefined,
    }
  }
  return components.find((c) => c.id === activeDrag.id) ?? null
}

export function CheckoutEditor({ onBack }: CheckoutEditorProps) {
  const {
    currentTemplate,
    addComponent,
    addComponentToCell,
    removeComponentFromCell,
    reorderZone,
    moveComponentToZone,
    selectComponent,
  } = useCheckoutStore()
  const { addToast } = useToast()

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false)

  // Sortables (itens do canvas) usam navegação por posição; paleta e itens
  // aninhados (useDraggable) usam passos de 25px (acessibilidade por teclado)
  const mixedCoordinateGetter: KeyboardCoordinateGetter = (event, args) => {
    const id = String(args.active)
    if (id.startsWith('palette-') || id.startsWith('nested-')) {
      return defaultKeyboardCoordinateGetter(event, args)
    }
    return sortableKeyboardCoordinates(event, args)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: mixedCoordinateGetter,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as
      | { componentType?: ComponentType; component?: CheckoutComponent }
      | undefined
    setActiveDrag({
      id: event.active.id as string,
      componentType: data?.componentType,
      component: data?.component,
    })
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveDrag(null)

      if (!over) return

      const activeIdStr = active.id.toString()
      const overId = over.id.toString()

      const zoneOf = (id: string): ComponentPlacement | null => {
        const found = currentTemplate?.components.find((c) => c.id === id)
        return found ? (found.placement ?? 'below') : null
      }

      const placementFromZoneId = (id: string): ComponentPlacement | null => {
        if (id === 'canvas-top') return 'above'
        if (id === 'canvas-bottom') return 'below'
        if (id === 'canvas-sidebar') return 'sidebar'
        return null
      }

      // Dragging nested component from grid cell
      if (activeIdStr.startsWith('nested-')) {
        const nestedMatch = activeIdStr.match(/^nested-(.+)-(\d+)-(.+)$/)
        if (!nestedMatch) return

        const fromParentId = nestedMatch[1]
        const fromCellIndex = parseInt(nestedMatch[2])
        const component = active.data.current?.component as CheckoutComponent

        // Drop on another grid cell
        if (overId.includes('-cell-')) {
          const cellMatch = overId.match(/^(.+)-cell-(\d+)$/)
          if (cellMatch) {
            const toParentId = cellMatch[1]
            const toCellIndex = parseInt(cellMatch[2])
            // Remove from source, add to target
            removeComponentFromCell(fromParentId, fromCellIndex)
            addComponentToCell(toParentId, toCellIndex, component.type)
          }
          return
        }

        // Drop on a canvas zone - extract from grid into that zone
        const nestedZone = placementFromZoneId(overId)
        if (nestedZone) {
          removeComponentFromCell(fromParentId, fromCellIndex)
          addComponent(component.type, nestedZone)
          return
        }

        // Drop on a top-level item - extract into that item's zone
        const overZone = zoneOf(overId)
        if (overZone) {
          removeComponentFromCell(fromParentId, fromCellIndex)
          addComponent(component.type, overZone)
          return
        }

        // Drop elsewhere - just remove from source
        removeComponentFromCell(fromParentId, fromCellIndex)
        return
      }

      // Dragging from palette to grid cell
      if (activeIdStr.startsWith('palette-') && overId.includes('-cell-')) {
        const componentType = active.data.current?.componentType as ComponentType
        const cellMatch = overId.match(/^(.+)-cell-(\d+)$/)
        if (componentType && cellMatch) {
          const parentId = cellMatch[1]
          const cellIndex = parseInt(cellMatch[2])
          addComponentToCell(parentId, cellIndex, componentType)
        }
        return
      }

      // Dragging from palette to a canvas zone (above or below the fixed form)
      if (activeIdStr.startsWith('palette-')) {
        const componentType = active.data.current?.componentType as ComponentType
        if (!componentType) return
        const paletteZone = placementFromZoneId(overId)
        if (paletteZone) {
          addComponent(componentType, paletteZone)
          return
        }
        // Dropped over an existing item - add into that item's zone
        addComponent(componentType, zoneOf(overId) ?? 'below')
        return
      }

      // Reordering top-level items (same zone) or moving across zones
      if (active.id !== over.id && currentTemplate) {
        const activeZone = zoneOf(activeIdStr)
        if (!activeZone) return

        // Dropped on a zone container - move to the end of that zone
        const targetZone = placementFromZoneId(overId)
        if (targetZone) {
          moveComponentToZone(activeIdStr, targetZone)
          return
        }

        const overZone = zoneOf(overId)
        if (!overZone) return

        if (overZone === activeZone) {
          const zoneIds = currentTemplate.components
            .filter((c) => (c.placement ?? 'below') === activeZone)
            .sort((a, b) => a.order - b.order)
            .map((c) => c.id)
          const oldIndex = zoneIds.indexOf(activeIdStr)
          const newIndex = zoneIds.indexOf(overId)
          if (oldIndex !== -1 && newIndex !== -1) {
            reorderZone(activeZone, arrayMove(zoneIds, oldIndex, newIndex))
          }
        } else {
          moveComponentToZone(activeIdStr, overZone, overId)
        }
      }
    },
    [addComponent, addComponentToCell, removeComponentFromCell, reorderZone, moveComponentToZone, currentTemplate]
  )

  const overlayComponent = resolveOverlayComponent(
    activeDrag,
    currentTemplate?.components ?? [],
  )

  const overlayConfig = overlayComponent
    ? CHECKOUT_COMPONENTS.find((c) => c.type === overlayComponent.type)
    : null

  // Handle component selection - opens the properties dialog
  const handleComponentSelect = (id: string) => {
    selectComponent(id)
  }

  const handleSave = () => {
    addToast('success', 'Checkout salvo com sucesso!')
  }

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-[#0b0e0e]">
      {/* Header */}
      <header className="h-14 border-b border-border dark:border-white/10 bg-card dark:bg-[#0b0e0e] flex items-center px-2 md:px-4 gap-2 md:gap-4 sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 hidden sm:block bg-border dark:bg-white/10" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10"
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
        >
          {isPaletteOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground dark:text-white truncate">
            {currentTemplate?.name || 'Novo Checkout'}
          </h1>
          <p className="text-xs text-muted-foreground dark:text-gray-400 truncate hidden sm:block">
            {currentTemplate?.description || 'Configure seu checkout'}
          </p>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <ThemeToggle />
          <Button
            variant={isBackgroundOpen ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 hidden lg:flex text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10"
            onClick={() => setIsBackgroundOpen(!isBackgroundOpen)}
          >
            <Palette className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block bg-border dark:bg-white/10" />
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} className="hidden xs:flex border-border dark:border-white/10 text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/10">
            <Eye className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button size="sm" className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Salvar</span>
          </Button>
          <Button size="icon" className="h-8 w-8 sm:hidden bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden relative">
          {/* Canvas - Takes remaining space, padded right for palette */}
          <div className="flex-1 overflow-y-auto pr-80">
            <Canvas onComponentSelect={handleComponentSelect} />
          </div>

          {/* Component Palette - Fixed Right Side */}
          <div className="hidden md:flex fixed right-0 top-14 bottom-0 w-80 border-l border-border dark:border-white/10 bg-sidebar dark:bg-[#0b0e0e] flex-col z-30">
            <ComponentPalette />
          </div>

          {/* Component Palette - Mobile Drawer */}
          {isPaletteOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsPaletteOpen(false)} />
              <div className="relative w-72 bg-sidebar border-l shadow-xl">
                <ComponentPalette />
              </div>
            </div>
          )}

          {/* Background Settings */}
          {isBackgroundOpen && (
            <div className="hidden lg:block">
              <BackgroundSettings />
            </div>
          )}
        </div>

        {/* Drag Overlay (some instantaneamente no drop, sem voltar à origem) */}
        <DragOverlay dropAnimation={null}>
          {overlayComponent && overlayConfig ? (
            <div className="w-[500px] opacity-80 pointer-events-none">
              <CheckoutComponentRenderer
                component={overlayComponent}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Component Properties Dialog */}
      <ComponentPropertiesDialog />

      {/* Preview Dialog */}
      <PreviewContainer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}
