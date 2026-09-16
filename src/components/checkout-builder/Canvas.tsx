import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useCheckoutStore } from '@/stores/checkoutStore'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { CheckoutComponentRenderer } from './CheckoutComponentRenderer'
import { ThemeProvider } from './ThemeProvider'
import { SecurePurchaseSidebar } from './SecurePurchaseSidebar'
import { FixedCheckoutForm } from './FixedCheckoutForm'
import type { CheckoutComponent } from '@/types/checkout'

interface SortableItemProps {
  component: CheckoutComponent
  isSelected: boolean
  onSelect: (id: string) => void
}

function SortableItem({ component, isSelected, onSelect }: SortableItemProps) {
  const { removeComponent, duplicateComponent, removeComponentDeep } = useCheckoutStore()
  const { over } = useDndContext()
  const isDropTarget = over?.id === component.id && !isSelected

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const handleDuplicate = () => {
    duplicateComponent(component.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? '' : ''}`}
    >
      <CheckoutComponentRenderer
        component={component}
        isSelected={isSelected}
        isDropTarget={isDropTarget}
        onClick={() => onSelect(component.id)}
        onDelete={() => removeComponent(component.id)}
        onDuplicate={handleDuplicate}
        onSettings={() => onSelect(component.id)}
        onNestedSelect={onSelect}
        onNestedDelete={removeComponentDeep}
        onNestedDuplicate={duplicateComponent}
        onNestedSettings={onSelect}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </div>
  )
}

interface DropZoneProps {
  id: string
  children: React.ReactNode
}

function DropZone({ id, children }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`w-full rounded-xl transition-colors ${
        isOver ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-500/5' : ''
      }`}
    >
      {children}
    </div>
  )
}

interface CanvasProps {
  onComponentSelect?: (id: string) => void
}

export function Canvas({ onComponentSelect }: CanvasProps) {
  const { currentTemplate, selectedComponentId } = useCheckoutStore()

  const components = (currentTemplate?.components || []).slice()

  if (!currentTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhum checkout selecionado</p>
          <p className="text-sm mt-1">Crie ou selecione um checkout para começar</p>
        </div>
      </div>
    )
  }

  // Filter out fixed components (product-card, form-field, payment-methods, order-summary)
  // These are always rendered by FixedCheckoutForm
  const fixedTypes = ['product-card', 'form-field', 'payment-methods', 'order-summary']
  const userComponents = components.filter(c => !fixedTypes.includes(c.type))

  const sortByOrder = (a: CheckoutComponent, b: CheckoutComponent) => a.order - b.order
  const aboveComponents = userComponents
    .filter(c => c.placement === 'above')
    .sort(sortByOrder)
  const belowComponents = userComponents
    .filter(c => (c.placement ?? 'below') === 'below')
    .sort(sortByOrder)
  const sidebarComponents = userComponents
    .filter(c => c.placement === 'sidebar')
    .sort(sortByOrder)

  const handleSelect = (id: string) => {
    onComponentSelect?.(id)
  }

  return (
    <ThemeProvider theme={currentTemplate.theme}>
      <div
        className="flex-1 h-full overflow-y-auto bg-muted/30 dark:bg-[#0b0e0e] p-4 md:p-6 lg:p-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-6 gap-4">
            {/* Main Form Area - 4 columns */}
            <div className="col-span-4">
              <div className="bg-[var(--theme-form-background)] rounded-2xl overflow-hidden">
                <div className="p-5 w-full">
                  <div className="flex w-full flex-col items-stretch gap-3">
                    {/* Drop zone ABOVE the fixed form */}
                    <DropZone id="canvas-top">
                      {aboveComponents.length > 0 ? (
                        <SortableContext
                          items={aboveComponents.map((c) => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex w-full flex-col items-stretch gap-3">
                            {aboveComponents.map((component) => (
                              <SortableItem
                                key={component.id}
                                component={component}
                                isSelected={selectedComponentId === component.id}
                                onSelect={handleSelect}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      ) : (
                        <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center opacity-60">
                          <p className="text-sm text-gray-400">
                            Arraste uma linha aqui para adicionar acima do checkout
                          </p>
                        </div>
                      )}
                    </DropZone>

                    {/* Fixed Checkout Form - Always rendered, not draggable */}
                    <FixedCheckoutForm
                      productName={currentTemplate.name}
                      productPrice={197}
                      productOriginalPrice={297}
                      installmentPrice={16.42}
                      installments={12}
                    />

                    {/* Drop zone BELOW the fixed form */}
                    <DropZone id="canvas-bottom">
                      {belowComponents.length > 0 ? (
                        <>
                          <div className="w-full border-t border-dashed border-gray-200 my-4" />
                          <p className="text-xs text-gray-400 mb-2">Componentes adicionais</p>
                          <SortableContext
                            items={belowComponents.map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex w-full flex-col items-stretch gap-3">
                              {belowComponents.map((component) => (
                                <SortableItem
                                  key={component.id}
                                  component={component}
                                  isSelected={selectedComponentId === component.id}
                                  onSelect={handleSelect}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </>
                      ) : (
                        <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                          <GripVertical className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">
                            Arraste componentes aqui para adicionar abaixo do checkout
                          </p>
                        </div>
                      )}
                    </DropZone>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 2 columns */}
            <div className="col-span-2">
              <div className="sticky top-0 flex flex-col gap-3">
                <SecurePurchaseSidebar
                  productName={currentTemplate.name}
                  productPrice={197}
                />

                {/* Drop zone BELOW the sidebar card */}
                <DropZone id="canvas-sidebar">
                  {sidebarComponents.length > 0 ? (
                    <SortableContext
                      items={sidebarComponents.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex w-full flex-col items-stretch gap-3">
                        {sidebarComponents.map((component) => (
                          <SortableItem
                            key={component.id}
                            component={component}
                            isSelected={selectedComponentId === component.id}
                            onSelect={handleSelect}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="w-full border-2 border-dashed border-gray-600 rounded-xl p-4 text-center opacity-60">
                      <p className="text-sm text-gray-400">
                        Arraste componentes aqui para adicionar na lateral
                      </p>
                    </div>
                  )}
                </DropZone>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
