import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckoutComponent, CheckoutTemplate, BackgroundConfig, ThemeConfig, ComponentPlacement, GridChild } from '@/types/checkout'
import { generateId } from '@/lib/utils'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'

/** Clona com novos ids em todos os níveis (grids aninhados, preserva células vazias). */
function cloneComponentDeep(component: CheckoutComponent): CheckoutComponent {
  return {
    ...component,
    id: generateId(),
    props: JSON.parse(JSON.stringify(component.props)),
    children: component.children?.map((c) => (c ? cloneComponentDeep(c) : c)),
  }
}

/** Aplica updater nos children do componente com parentId, em qualquer profundidade. */
function updateChildrenDeep(
  components: CheckoutComponent[],
  parentId: string,
  updater: (children: GridChild[]) => GridChild[],
): { components: CheckoutComponent[]; found: boolean } {
  let found = false
  const next = components.map((c) => {
    if (!c) return c
    if (c.id === parentId) {
      found = true
      return { ...c, children: updater([...(c.children || [])]) }
    }
    if (c.children && c.children.length > 0) {
      // Itera os filhos crus (com buracos) para não reindexar as células.
      const nested = updateChildrenDeep(c.children as CheckoutComponent[], parentId, updater)
      if (nested.found) {
        found = true
        return { ...c, children: nested.components }
      }
    }
    return c
  })
  return { components: next, found }
}

/** Busca componente por id em qualquer profundidade (ignora células vazias). */
function findComponentDeep(
  components: CheckoutComponent[],
  id: string,
): CheckoutComponent | undefined {
  for (const c of components) {
    if (!c) continue
    if (c.id === id) return c
    if (c.children) {
      const found = findComponentDeep(c.children as CheckoutComponent[], id)
      if (found) return found
    }
  }
  return undefined
}

/** Verifica se a subárvore contém o id (guarda contra mover um grid para dentro de si). */
function containsId(component: CheckoutComponent | undefined | null, id: string): boolean {
  if (!component) return false
  if (component.id === id) return true
  return (component.children || []).some((c) => c && containsId(c, id))
}

/** Retorna o id do pai que contém diretamente o id dado, ou undefined se for top-level. */
function findParentIdOf(components: CheckoutComponent[], id: string): string | undefined {
  for (const c of components) {
    if (!c) continue
    if ((c.children || []).some((ch) => ch && ch.id === id)) return c.id
    if (c.children) {
      const found = findParentIdOf(
        c.children.filter((ch): ch is CheckoutComponent => Boolean(ch)),
        id,
      )
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
  /** Paleta → célula. Retorna false (sem alterar) se a célula já está ocupada. */
  addComponentToCell: (parentId: string, cellIndex: number, type: CheckoutComponent['type']) => boolean
  removeComponentFromCell: (parentId: string, cellIndex: number) => void
  /** Canvas → célula (preserva o objeto; ocupada = troca de lugar). */
  moveComponentToCell: (id: string, toParentId: string, toCellIndex: number) => boolean
  /** Célula → célula (preserva o objeto; ocupada = troca). */
  moveCellComponent: (fromParentId: string, fromCellIndex: number, toParentId: string, toCellIndex: number) => boolean
  /** Célula → zona do canvas (preserva o objeto). */
  extractCellComponentToZone: (fromParentId: string, fromCellIndex: number, placement: ComponentPlacement) => boolean
  duplicateComponent: (id: string) => void
  updateComponent: (id: string, updates: Partial<CheckoutComponent>) => void
  removeComponent: (id: string) => void
  /** Remove componente em qualquer profundidade (grids aninhados). */
  removeComponentDeep: (id: string) => void
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
        if (!currentTemplate) return false

        const parentComponent = findComponentDeep(currentTemplate.components, parentId)
        if (!parentComponent) return false
        // Célula ocupada: não sobrescreve em silêncio (o chamador avisa).
        if (parentComponent.children?.[cellIndex]) return false

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
        if (!found) return false

        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
        // Sem auto-seleção: o modal de propriedades abre só no clique.
        return true
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
            // Esparso de propósito: o índice do array É a célula. Sem filter!
            children[cellIndex] = undefined
            return children
          },
        )
        if (!found) return

        get().updateTemplate(currentTemplate.id, { components: updatedComponents })

        if (removedChild && selectedComponentId === removedChild.id) {
          set({ selectedComponentId: null })
        }
      },

      moveComponentToCell: (id, toParentId, toCellIndex) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return false

        const sourceIndex = currentTemplate.components.findIndex((c) => c && c.id === id)
        if (sourceIndex === -1) return false
        const source = currentTemplate.components[sourceIndex]
        // Guarda de ciclo: grid não entra dentro de si mesmo.
        if (toParentId === id || containsId(source, toParentId)) return false

        const target = findComponentDeep(currentTemplate.components, toParentId)
        if (!target) return false

        const withoutSource = currentTemplate.components.filter((c) => c && c.id !== id)
        const cellComponent: CheckoutComponent = {
          ...source,
          order: toCellIndex,
          placement: undefined,
        }
        const displaced = target.children?.[toCellIndex]

        const { components: withCell, found } = updateChildrenDeep(
          withoutSource,
          toParentId,
          (children) => {
            children[toCellIndex] = cellComponent
            return children
          },
        )
        if (!found) return false

        // Célula ocupada: o deslocado assume o lugar do movido no canvas.
        const finalComponents = displaced
          ? [
              ...withCell.slice(0, sourceIndex),
              {
                ...displaced,
                placement: source.placement ?? 'below',
                order: source.order,
              } as CheckoutComponent,
              ...withCell.slice(sourceIndex),
            ]
          : withCell

        get().updateTemplate(currentTemplate.id, { components: finalComponents })
        return true
      },

      moveCellComponent: (fromParentId, fromCellIndex, toParentId, toCellIndex) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return false
        if (fromParentId === toParentId && fromCellIndex === toCellIndex) return true

        const fromParent = findComponentDeep(currentTemplate.components, fromParentId)
        const moving = fromParent?.children?.[fromCellIndex]
        if (!moving) return false

        const toParent = findComponentDeep(currentTemplate.components, toParentId)
        if (!toParent) return false

        // Mesmo grid: troca os ocupantes num único update.
        if (fromParentId === toParentId) {
          const occupant = toParent.children?.[toCellIndex]
          const { components: updatedComponents, found } = updateChildrenDeep(
            currentTemplate.components,
            fromParentId,
            (children) => {
              children[fromCellIndex] = occupant ? { ...occupant, order: fromCellIndex } : undefined
              children[toCellIndex] = { ...moving, order: toCellIndex }
              return children
            },
          )
          if (!found) return false
          get().updateTemplate(currentTemplate.id, { components: updatedComponents })
          return true
        }

        // Grids diferentes: deslocado (se houver) volta para a célula de origem.
        const displaced = toParent.children?.[toCellIndex]
        const cleared = updateChildrenDeep(
          currentTemplate.components,
          fromParentId,
          (children) => {
            children[fromCellIndex] = displaced ? { ...displaced, order: fromCellIndex } : undefined
            return children
          },
        )
        if (!cleared.found) return false

        const placed = updateChildrenDeep(
          cleared.components,
          toParentId,
          (children) => {
            children[toCellIndex] = { ...moving, order: toCellIndex }
            return children
          },
        )
        if (!placed.found) return false

        get().updateTemplate(currentTemplate.id, { components: placed.components })
        return true
      },

      extractCellComponentToZone: (fromParentId, fromCellIndex, placement) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return false

        const fromParent = findComponentDeep(currentTemplate.components, fromParentId)
        const moving = fromParent?.children?.[fromCellIndex]
        if (!moving) return false

        const cleared = updateChildrenDeep(
          currentTemplate.components,
          fromParentId,
          (children) => {
            children[fromCellIndex] = undefined
            return children
          },
        )
        if (!cleared.found) return false

        const zoneOrders = cleared.components
          .filter((c) => c && (c.placement ?? 'below') === placement)
          .map((c) => c.order)
        const extracted: CheckoutComponent = {
          ...moving,
          placement,
          order: zoneOrders.length > 0 ? Math.max(...zoneOrders) + 1 : 0,
        }

        get().updateTemplate(currentTemplate.id, {
          components: [...cleared.components, extracted],
        })
        return true
      },

      duplicateComponent: (id) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const sourceComponent = findComponentDeep(currentTemplate.components, id)
        if (!sourceComponent) return

        const isNested = !currentTemplate.components.some((c) => c.id === id)
        const duplicatedComponent: CheckoutComponent = {
          id: generateId(),
          type: sourceComponent.type,
          props: JSON.parse(JSON.stringify(sourceComponent.props)),
          order: currentTemplate.components.length,
          placement: sourceComponent.placement ?? 'below',
          fullWidth: sourceComponent.fullWidth ?? true,
          gridColumns: sourceComponent.gridColumns,
          children: sourceComponent.children?.map((c) => (c ? cloneComponentDeep(c) : c)),
        }

        // Nested: encaixa na primeira célula vazia do próprio grid.
        if (isNested) {
          const parentId = findParentIdOf(currentTemplate.components, id)
          if (parentId) {
            const { components: withCell, found } = updateChildrenDeep(
              currentTemplate.components,
              parentId,
              (children) => {
                const fresh: CheckoutComponent = {
                  ...duplicatedComponent,
                  id: generateId(),
                  children: sourceComponent.children?.map((c) => (c ? cloneComponentDeep(c) : c)),
                }
                const firstEmpty = children.findIndex((ch) => !ch)
                const idx = firstEmpty === -1 ? children.length : firstEmpty
                children[idx] = fresh
                return children
              },
            )
            if (found) get().updateTemplate(currentTemplate.id, { components: withCell })
          }
          return
        }

        const updatedComponents = [...currentTemplate.components, duplicatedComponent]
        get().updateTemplate(currentTemplate.id, { components: updatedComponents })
        // Mantém a seleção atual: o modal abre só no clique.
      },

      updateComponent: (id, updates) => {
        const { currentTemplate } = get()
        if (!currentTemplate) return

        const applyUpdate = (list: GridChild[]): GridChild[] =>
          list.map((c) => {
            if (!c) return c
            if (c.id === id) return { ...c, ...updates }
            if (c.children) return { ...c, children: applyUpdate(c.children) }
            return c
          })

        const updatedComponents = applyUpdate(currentTemplate.components) as CheckoutComponent[]
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

      removeComponentDeep: (id) => {
        const { currentTemplate, selectedComponentId } = get()
        if (!currentTemplate) return

        // Perde uma célula ocupada ao remover; é o caminho esperado (excluir).
        const withoutComponent = (list: GridChild[]): GridChild[] => {
          const next: GridChild[] = list.map((c) => {
            if (!c) return c
            if (c.id === id) return undefined
            if (c.children) return { ...c, children: withoutComponent(c.children) }
            return c
          })
          // Compacta as células ocupadas à esquerda (sem buracos de itens removidos).
          const occupied = next.filter(Boolean) as CheckoutComponent[]
          return [...occupied]
        }

        const updatedComponents = withoutComponent(currentTemplate.components) as CheckoutComponent[]
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
