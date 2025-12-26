/**
 * Tests for lib/utils (cn function)
 */
import { cn } from '@/lib/utils'

describe('cn (classname utility)', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2', 'py-4')
    expect(result).toBe('px-2 py-4')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active')
    expect(result).toBe('base-class active')
  })

  it('handles false conditions', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active')
    expect(result).toBe('base-class')
  })

  it('handles undefined values', () => {
    const result = cn('base-class', undefined, 'other-class')
    expect(result).toBe('base-class other-class')
  })

  it('merges conflicting tailwind classes (takes last)', () => {
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('merges conflicting tailwind colors', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('handles object notation', () => {
    const result = cn({ 'text-red-500': true, 'text-blue-500': false })
    expect(result).toBe('text-red-500')
  })

  it('handles array of classes', () => {
    const result = cn(['class-a', 'class-b'])
    expect(result).toBe('class-a class-b')
  })

  it('returns empty string for no arguments', () => {
    const result = cn()
    expect(result).toBe('')
  })
})
