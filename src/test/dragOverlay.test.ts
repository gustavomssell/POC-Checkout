import { describe, it, expect } from 'vitest'
import { resolveOverlayComponent } from '@/components/checkout-builder/CheckoutEditor'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'
import type { CheckoutComponent } from '@/types/checkout'

const header: CheckoutComponent = {
  id: 'h1',
  type: 'header',
  props: {},
  order: 0,
}

describe('resolveOverlayComponent', () => {
  it('retorna null sem drag ativo', () => {
    expect(resolveOverlayComponent(null, [header])).toBeNull()
  })

  it('retorna o componente do canvas pelo id', () => {
    expect(resolveOverlayComponent({ id: 'h1' }, [header])).toBe(header)
  })

  it('retorna null para id desconhecido', () => {
    expect(resolveOverlayComponent({ id: 'nope' }, [header])).toBeNull()
  })

  it('retorna o componente aninhado dos dados do drag', () => {
    const nested: CheckoutComponent = { id: 'n1', type: 'coupon', props: {}, order: 0 }
    expect(resolveOverlayComponent({ id: 'nested-x-0-n1', component: nested }, [header])).toBe(nested)
  })

  it('monta preview da paleta com os defaults do catálogo', () => {
    const preview = resolveOverlayComponent({ id: 'palette-coupon', componentType: 'coupon' }, [header])
    const config = CHECKOUT_COMPONENTS.find((c) => c.type === 'coupon')
    expect(preview).toMatchObject({ type: 'coupon', props: config?.defaultProps })
    expect(preview?.id).toContain('preview-')
  })

  it('monta grid vazio da paleta com colunas corretas', () => {
    const preview = resolveOverlayComponent({ id: 'palette-grid-3', componentType: 'grid-3' }, [])
    expect(preview?.children).toEqual([])
    expect(preview?.gridColumns).toBe(3)
  })

  it('retorna null para tipo de paleta inválido', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(resolveOverlayComponent({ id: 'palette-x', componentType: 'x' as any }, [])).toBeNull()
  })

  it('não muta os defaults do catálogo', () => {
    const before = JSON.stringify(CHECKOUT_COMPONENTS.find((c) => c.type === 'coupon')?.defaultProps)
    const preview = resolveOverlayComponent({ id: 'palette-coupon', componentType: 'coupon' }, [])
    if (preview) preview.props.label = 'MUTATED'
    const after = JSON.stringify(CHECKOUT_COMPONENTS.find((c) => c.type === 'coupon')?.defaultProps)
    expect(after).toBe(before)
  })
})
