import '@testing-library/jest-dom'

// jsdom não tem ResizeObserver/RAF — necessários para renderizar o ReactFlow nos testes.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    private callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      // Reporta dimensão fictícia para que libs (ReactFlow) meçam os nós.
      this.callback(
        [{ target, contentRect: { width: 172, height: 60 } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 0)) as typeof requestAnimationFrame
}
