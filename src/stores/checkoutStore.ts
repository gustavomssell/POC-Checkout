import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckoutComponent, CheckoutTemplate, BackgroundConfig, ThemeConfig, ComponentPlacement } from '@/types/checkout'
import { generateId } from '@/lib/utils'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'

/** Clona com novos ids em todos os níveis (grids aninhados). */
function cloneComponentDeep(component: CheckoutComponent): CheckoutComponent {
  return {
    ...component,
    id: generateId(),
    props: JSON.parse(JSON.stringify(component.props)),
    children: component.children?.map(cloneComponentDeep),
  }
}

/** Aplica updater nos children do componente com parentId, em qualquer profundidade. */
function updateChildrenDeep(
  components: CheckoutComponent[],
  parentId: string,
  updater: (children: CheckoutComponent[]) => CheckoutComponent[],
): { components: CheckoutComponent[]; found: boolean } {
  let found = false
  const next = components.map((c) => {
    if (c.id === parentId) {
      found = true
      return { ...c, children: updater([...(c.children || [])]) }
    }
    if (c.children && c.children.length > 0) {
      const nested = updateChildrenDeep(c.children, parentId, updater)
      if (nested.found) {
        found = true
        return { ...c, children: nested.components }
      }
    }
    return c
  })
  return { components: next, found }
}

/** Busca componente por id em qualquer profundidade. */
function findComponentDeep(
  components: CheckoutComponent[],
  id: string,
): CheckoutComponent | undefined {
  for (const c of components) {
    if (c.id === id) return c
    if (c.children) {
      const found = findComponentDeep(c.children, id)
      if (found) return found
    }
  }
  return undefined
}

interface CheckoutState {
  templates: CheckoutTemplate[]
  currentTemplate: CheckoutTemplate | null
  selectedComponentId: string | null

  createTemplate: (name: string, description: string) => string
  updateTemplate: (id: string, updates: Partial<CheckoutTemplate>) => void
  deleteTemplate: (id: string) => void
  loadTemplate: (id: string) => void

  addComponent: (type: CheckoutComponent['type'], placement?: ComponentPlacement) => void
  addComponentToCell: (parentId: string, cellIndex: number, type: CheckoutComponent['type']) => void
  removeComponentFromCell: (parentId: string, cellIndex: number) => void
  duplicateComponent: (id: string) => void
  updateComponent: (id: string, updates: Partial<CheckoutComponent>) => void
  removeComponent: (id: string) => void
  reorderComponents: (components: CheckoutComponent[]) => void
  reorderZone: (placement: ComponentPlacement, orderedIds: string[]) => void
  moveComponentToZone: (id: string, placement: ComponentPlacement, beforeId?: string) => void
  selectComponent: (id: string | null) => void
  updateBackground: (background: BackgroundConfig) => void
  updateTheme: (theme: ThemeConfig) => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      templates: [],
      currentTemplate: null,
      selectedComponentId: null,

      createTemplate: (name, description) => {
        const id = generateId()
        const newTemplate: CheckoutTemplate = {
          id,
          name,
          description,
          components: [],
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
          set({ currentTemplate: template, selectedComponentId: null })
        }
      },

      addComponent: (type, placement = 'below') => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const config = CHECKOUT_COMPONENTS.find((c) => c.type === type)
        const zoneOrders = currentTemplate.components
          .filter((c) => (c.placement ?? 'below') === placement)
          .map((c) => c.order)
        const component: CheckoutComponent = {
          id: generateId(),
          type,
          props: config?.defaultProps ? JSON.parse(JSON.stringify(config.defaultProps)) : {},
          order: zoneOrders.length > 0 ? Math.max(...zoneOrders) + 1 : 0,
          gridColumns: config?.gridColumns,
          children: config?.isGrid ? [] : undefined,
          placement,
          fullWidth: true,
        }

        const updatedComponents = [...currentTemplate.components, component]
        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
        // Sem auto-seleção: o modal de propriedades abre só no clique.
      },

      addComponentToCell: (parentId, cellIndex, type) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const config = CHECKOUT_COMPONENTS.find((c) => c.type === type)
        const newComponent: CheckoutComponent = {
          id: generateId(),
          type,
          props: config?.defaultProps ? JSON.parse(JSON.stringify(config.defaultProps)) : {},
          order: cellIndex,
          gridColumns: config?.gridColumns,
          children: config?.isGrid ? [] : undefined,
        }

        const { components: updatedComponents, found } = updateChildrenDeep(
          currentTemplate.components,
          parentId,
          (children) => {
            children[cellIndex] = newComponent
            return children
          },
        )
        if (!found) return

        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
        // Sem auto-seleção: o modal de propriedades abre só no clique.
      },

      removeComponentFromCell: (parentId, cellIndex) => {
        const { currentTemplate, selectedComponentId } = get()
        if (!currentTemplate) return

        const parentComponent = findComponentDeep(currentTemplate.components, parentId)
        if (!parentComponent || !parentComponent.children) return

        const removedChild = parentComponent.children[cellIndex]
        const { components: updatedComponents, found } = updateChildrenDeep(
          currentTemplate.components,
          parentId,
          (children) => {
            children[cellIndex] = undefined as unknown as CheckoutComponent
            return children.filter(Boolean)
          },
        )
        if (!found) return

        get().updateTemplate(currentTemplate.id, { components: updatedComponents })

        if (selectedComponentId === removedChild?.id) {
          set({ selectedComponentId: null })
        }
      },

      duplicateComponent: (id) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const sourceComponent = currentTemplate.components.find((c) => c.id === id)
        if (!sourceComponent) return

        const duplicatedComponent: CheckoutComponent = {
          id: generateId(),
          type: sourceComponent.type,
          props: JSON.parse(JSON.stringify(sourceComponent.props)),
          order: currentTemplate.components.length,
          placement: sourceComponent.placement ?? 'below',
          fullWidth: sourceComponent.fullWidth ?? true,
          gridColumns: sourceComponent.gridColumns,
          children: sourceComponent.children?.map(cloneComponentDeep),
        }

        const updatedComponents = [...currentTemplate.components, duplicatedComponent]
        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
        // Mantém a seleção atual: o modal abre só no clique.
      },

      updateComponent: (id, updates) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const updatedComponents = currentTemplate.components.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        )
        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
      },

      removeComponent: (id) => {
        const { currentTemplate, selectedComponentId } = get()
        if (!currentTemplate) return

        const updatedComponents = currentTemplate.components
          .filter((c) => c.id !== id)
          .map((c, i) => ({ ...c, order: i }))

        get().updateTemplate(currentTemplate.id, { components: updatedComponents })

        if (selectedComponentId === id) {
          set({ selectedComponentId: null })
        }
      },

      reorderComponents: (components) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const reordered = components.map((c, i) => ({ ...c, order: i }))
        get().updateTemplate(currentTemplate.id, { components: reordered })
      },

      reorderZone: (placement, orderedIds) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
        const updatedComponents = currentTemplate.components.map((c) =>
          (c.placement ?? 'below') === placement && orderMap.has(c.id)
            ? { ...c, order: orderMap.get(c.id)! }
            : c
        )
        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
      },

      moveComponentToZone: (id, placement, beforeId) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const targetIds = currentTemplate.components
          .filter((c) => c.id !== id && (c.placement ?? 'below') === placement)
          .sort((a, b) => a.order - b.order)
          .map((c) => c.id)

        let insertAt = targetIds.length
        if (beforeId) {
          const idx = targetIds.indexOf(beforeId)
          if (idx !== -1) insertAt = idx
        }
        targetIds.splice(insertAt, 0, id)

        const orderMap = new Map(targetIds.map((cid, i) => [cid, i]))
        const updatedComponents = currentTemplate.components.map((c) => {
          if (c.id === id) return { ...c, placement, order: orderMap.get(c.id)! }
          if ((c.placement ?? 'below') === placement && orderMap.has(c.id)) {
            return { ...c, order: orderMap.get(c.id)! }
          }
          return c
        })
        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
      },

      selectComponent: (id) => {
        set({ selectedComponentId: id })
      },

      updateBackground: (background) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        get().updateTemplate(currentTemplate.id, { background })
      },

      updateTheme: (theme) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return
        get().updateTemplate(currentTemplate.id, { theme })
      },
    }),
    {
      name: 'checkout-storage',
    }
  )
)
