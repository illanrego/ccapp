import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  parseCurrency,
  formatPercentage,
  formatNumber,
} from '../formatters'

describe('formatCurrency', () => {
  it('should format simple values', () => {
    expect(formatCurrency(100)).toBe('R$ 100,00')
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('should format decimal values', () => {
    expect(formatCurrency(99.99)).toBe('R$ 99,99')
    expect(formatCurrency(1.5)).toBe('R$ 1,50')
    expect(formatCurrency(0.01)).toBe('R$ 0,01')
  })

  it('should format thousands with dots', () => {
    expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    expect(formatCurrency(12345.67)).toBe('R$ 12.345,67')
    expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-100)).toBe('R$ -100,00')
    expect(formatCurrency(-1234.56)).toBe('R$ -1.234,56')
  })

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('R$ 11,00')
    expect(formatCurrency(10.994)).toBe('R$ 10,99')
    // Note: 10.995 rounds to 10.99 due to floating point representation
    expect(formatCurrency(10.996)).toBe('R$ 11,00')
  })
})

describe('parseCurrency', () => {
  it('should parse simple currency strings', () => {
    expect(parseCurrency('R$ 100,00')).toBe(100)
    expect(parseCurrency('R$ 0,00')).toBe(0)
  })

  it('should parse values with thousands separator', () => {
    expect(parseCurrency('R$ 1.000,00')).toBe(1000)
    expect(parseCurrency('R$ 12.345,67')).toBe(12345.67)
  })

  it('should handle values without R$ prefix', () => {
    expect(parseCurrency('100,00')).toBe(100)
    expect(parseCurrency('1.234,56')).toBe(1234.56)
  })

  it('should handle extra whitespace', () => {
    expect(parseCurrency('R$  100,00')).toBe(100)
    expect(parseCurrency(' R$ 100,00 ')).toBe(100)
  })

  it('should return 0 for invalid strings', () => {
    expect(parseCurrency('')).toBe(0)
    expect(parseCurrency('abc')).toBe(0)
    expect(parseCurrency('R$')).toBe(0)
  })
})

describe('formatPercentage', () => {
  it('should format decimal as percentage', () => {
    expect(formatPercentage(0.25)).toBe('25%')
    expect(formatPercentage(1)).toBe('100%')
    expect(formatPercentage(0)).toBe('0%')
  })

  it('should handle decimal places', () => {
    expect(formatPercentage(0.256, 1)).toBe('25.6%')
    expect(formatPercentage(0.2567, 2)).toBe('25.67%')
  })

  it('should handle values greater than 100%', () => {
    expect(formatPercentage(1.5)).toBe('150%')
    expect(formatPercentage(2)).toBe('200%')
  })

  it('should handle negative percentages', () => {
    expect(formatPercentage(-0.1)).toBe('-10%')
  })
})

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1.000')
    expect(formatNumber(1234567)).toBe('1.234.567')
  })

  it('should handle decimal places', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1.234,57')
    expect(formatNumber(1000, 2)).toBe('1.000,00')
  })

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(0, 2)).toBe('0,00')
  })

  it('should handle small numbers', () => {
    expect(formatNumber(42)).toBe('42')
    expect(formatNumber(999)).toBe('999')
  })
})
