import { describe, it, expect, beforeEach } from 'vitest'
import { useCheckoutStore } from '@/stores/checkoutStore'

describe('CheckoutStore', () => {
  beforeEach(() => {
    useCheckoutStore.setState({
      templates: [],
      currentTemplate: null,
      selectedComponentId: null,
    })
  })

  it('should create a new template', () => {
    const { createTemplate } = useCheckoutStore.getState()
    const id = createTemplate('Test Checkout', 'A test checkout')

    const { templates } = useCheckoutStore.getState()
    expect(templates).toHaveLength(1)
    expect(templates[0].name).toBe('Test Checkout')
    expect(templates[0].description).toBe('A test checkout')
    expect(templates[0].id).toBe(id)
  })

  it('should add a component to the current template', () => {
    const { createTemplate } = useCheckoutStore.getState()
    createTemplate('Test Checkout', 'A test checkout')

    const { addComponent } = useCheckoutStore.getState()
    addComponent('header')

    const updated = useCheckoutStore.getState()
    expect(updated.currentTemplate?.components).toHaveLength(1)
    expect(updated.currentTemplate?.components[0].type).toBe('header')
  })

  it('should update a component', () => {
    const { createTemplate, addComponent } = useCheckoutStore.getState()
    createTemplate('Test Checkout', 'A test checkout')
    addComponent('product-card')

    const { currentTemplate, updateComponent } = useCheckoutStore.getState()
    const componentId = currentTemplate?.components[0].id
    expect(componentId).toBeDefined()

    updateComponent(componentId!, { props: { name: 'Updated Product' } })

    const updated = useCheckoutStore.getState()
    expect(updated.currentTemplate?.components[0].props.name).toBe('Updated Product')
  })

  it('should remove a component', () => {
    const { createTemplate, addComponent } = useCheckoutStore.getState()
    createTemplate('Test Checkout', 'A test checkout')
    addComponent('header')
    addComponent('footer')

    const { currentTemplate, removeComponent } = useCheckoutStore.getState()
    const componentId = currentTemplate?.components[0].id

    removeComponent(componentId!)

    const updated = useCheckoutStore.getState()
    expect(updated.currentTemplate?.components).toHaveLength(1)
  })

  it('should reorder components', () => {
    const { createTemplate, addComponent } = useCheckoutStore.getState()
    createTemplate('Test Checkout', 'A test checkout')
    addComponent('header')
    addComponent('footer')

    const { currentTemplate, reorderComponents } = useCheckoutStore.getState()
    const components = currentTemplate?.components || []

    reorderComponents([components[1], components[0]])

    const updated = useCheckoutStore.getState()
    expect(updated.currentTemplate?.components[0].type).toBe('footer')
    expect(updated.currentTemplate?.components[1].type).toBe('header')
  })

  it('should delete a template', () => {
    const { createTemplate } = useCheckoutStore.getState()
    const id = createTemplate('Test Checkout', 'A test checkout')

    const { deleteTemplate } = useCheckoutStore.getState()
    deleteTemplate(id)

    const { templates } = useCheckoutStore.getState()
    expect(templates).toHaveLength(0)
  })

  it('should default components to full width', () => {
    const { createTemplate, addComponent } = useCheckoutStore.getState()
    createTemplate('Test Checkout', 'A test checkout')
    addComponent('header')

    const component = useCheckoutStore.getState().currentTemplate?.components[0]
    expect(component?.fullWidth).toBe(true)
  })

  it('should toggle fullWidth and preserve it on duplicate', () => {
    const { createTemplate, addComponent, updateComponent, duplicateComponent } = useCheckoutStore.getState()
    createTemplate('Test Checkout', 'A test checkout')
    addComponent('header')

    const id = useCheckoutStore.getState().currentTemplate?.components[0].id
    updateComponent(id!, { fullWidth: false })
    expect(useCheckoutStore.getState().currentTemplate?.components[0].fullWidth).toBe(false)

    duplicateComponent(id!)
    const components = useCheckoutStore.getState().currentTemplate?.components || []
    expect(components).toHaveLength(2)
    expect(components[1].fullWidth).toBe(false)
  })
})
