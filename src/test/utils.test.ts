import { describe, it, expect } from 'vitest'
import { cn, generateId, formatCurrency } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', 'extra')
      expect(result).toContain('base')
      expect(result).toContain('extra')
      expect(result).not.toContain('hidden')
    })

    it('should merge Tailwind classes', () => {
      const result = cn('px-4 py-2', 'px-8')
      expect(result).toBe('py-2 px-8')
    })
  })

  describe('generateId', () => {
    it('should generate a unique id', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
    })

    it('should generate a string of 7 characters', () => {
      const id = generateId()
      expect(id.length).toBe(7)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in BRL', () => {
      const result = formatCurrency(197)
      expect(result).toMatch(/R\$\s*197,00/)
    })

    it('should format currency with decimals', () => {
      const result = formatCurrency(99.9)
      expect(result).toMatch(/R\$\s*99,90/)
    })

    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toMatch(/R\$\s*0,00/)
    })
  })
})
