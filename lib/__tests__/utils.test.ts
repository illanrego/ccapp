import { describe, it, expect } from 'vitest'
import { cn, formatDate } from '../utils'

describe('cn (className merge utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'disabled')).toBe('base active')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })
})

describe('formatDate', () => {
  it('should format a date string to Brazilian Portuguese format', () => {
    const result = formatDate('2024-01-15')
    expect(result).toContain('15')
    expect(result).toContain('janeiro')
    expect(result).toContain('2024')
  })

  it('should handle date string with time (ISO format)', () => {
    const result = formatDate('2024-06-20T10:30:00')
    expect(result).toContain('20')
    expect(result).toContain('junho')
    expect(result).toContain('2024')
  })

  it('should include weekday in the format', () => {
    // 2024-01-15 is a Monday
    const result = formatDate('2024-01-15')
    expect(result.toLowerCase()).toContain('segunda')
  })

  it('should format different months correctly', () => {
    expect(formatDate('2024-02-01')).toContain('fevereiro')
    expect(formatDate('2024-07-15')).toContain('julho')
    expect(formatDate('2024-12-25')).toContain('dezembro')
  })
})
