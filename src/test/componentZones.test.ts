import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutStore } from '@/stores/checkoutStore'

function resetStore() {
  useCheckoutStore.setState({
    templates: [],
    currentTemplate: null,
    selectedComponentId: null,
  })
}

function setup() {
  const { createTemplate } = useCheckoutStore.getState()
  createTemplate('T', 'D')
}

function ids() {
  return (useCheckoutStore.getState().currentTemplate?.components || []).map((c) => c.id)
}

describe('Zones (above / below / sidebar)', () => {
  beforeEach(resetStore)

  it('addComponent usa below por padrão', () => {
    setup()
    useCheckoutStore.getState().addComponent('header')
    const c = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(c?.placement).toBe('below')
  })

  it.each(['above', 'below', 'sidebar'] as const)('addComponent com placement %s', (placement) => {
    setup()
    useCheckoutStore.getState().addComponent('header', placement)
    const c = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(c?.placement).toBe(placement)
  })

  it('reorderZone reordena só dentro da zona', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('header', 'below')
    s.addComponent('footer', 'below')
    s.addComponent('coupon', 'above')
    const [headerId, footerId, couponId] = ids()

    useCheckoutStore.getState().reorderZone('below', [footerId, headerId])

    const comps = useCheckoutStore.getState().currentTemplate?.components || []
    const below = comps.filter((c) => (c.placement ?? 'below') === 'below').sort((a, b) => a.order - b.order)
    const above = comps.filter((c) => c.placement === 'above')
    expect(below.map((c) => c.id)).toEqual([footerId, headerId])
    expect(above.map((c) => c.id)).toEqual([couponId])
  })

  it('moveComponentToZone move entre zonas e insere antes do alvo', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('header', 'below')
    s.addComponent('footer', 'below')
    s.addComponent('coupon', 'above')
    const [headerId, footerId, couponId] = ids()

    useCheckoutStore.getState().moveComponentToZone(couponId, 'below', footerId)

    const comps = useCheckoutStore.getState().currentTemplate?.components || []
    const below = comps.filter((c) => (c.placement ?? 'below') === 'below').sort((a, b) => a.order - b.order)
    expect(below.map((c) => c.id)).toEqual([headerId, couponId, footerId])
  })

  it('moveComponentToZone sem alvo anexa no fim da zona', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('header', 'sidebar')
    s.addComponent('footer', 'below')
    const [headerId, footerId] = ids()

    useCheckoutStore.getState().moveComponentToZone(footerId, 'sidebar')

    const comps = useCheckoutStore.getState().currentTemplate?.components || []
    const sidebar = comps.filter((c) => c.placement === 'sidebar').sort((a, b) => a.order - b.order)
    expect(sidebar.map((c) => c.id)).toEqual([headerId, footerId])
  })

  it('duplicate preserva o placement', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('header', 'above')
    const [headerId] = ids()

    useCheckoutStore.getState().duplicateComponent(headerId)

    const comps = useCheckoutStore.getState().currentTemplate?.components || []
    expect(comps).toHaveLength(2)
    expect(comps[1].placement).toBe('above')
    expect(comps[1].id).not.toBe(headerId)
  })
})

describe('Grid cells', () => {
  beforeEach(resetStore)

  it('addComponentToCell insere o componente na célula', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('grid-2')
    const [gridId] = ids()

    useCheckoutStore.getState().addComponentToCell(gridId, 1, 'coupon')

    const grid = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(grid?.children?.[1]?.type).toBe('coupon')
    expect(grid?.children?.[1]?.id).toBeTruthy()
  })

  it('removeComponentFromCell limpa a célula', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('grid-2')
    const [gridId] = ids()
    s.addComponentToCell(gridId, 0, 'coupon')

    useCheckoutStore.getState().removeComponentFromCell(gridId, 0)

    const grid = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(grid?.children?.filter(Boolean)).toHaveLength(0)
  })

  it('removeComponentFromCell com índice vazio não quebra', () => {
    setup()
    const s = useCheckoutStore.getState()
    s.addComponent('grid-2')
    const [gridId] = ids()

    expect(() =>
      useCheckoutStore.getState().removeComponentFromCell(gridId, 0),
    ).not.toThrow()
  })
})
