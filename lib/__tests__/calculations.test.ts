import { describe, it, expect } from 'vitest'
import {
  calculateMargin,
  calculateProfit,
  calculateAverage,
  calculateBarProfit,
  calculateAdjustedTicketRevenue,
  calculateTotalShowRevenue,
  calculateComandaTotal,
  calculateStockValue,
  isLowStock,
  getTransactionQuantityAdjustment,
} from '../calculations'

describe('calculateMargin', () => {
  it('should calculate profit margin correctly', () => {
    // Cost 10, sell for 15 = 50% margin
    expect(calculateMargin(15, 10)).toBe(50)
    // Cost 100, sell for 200 = 100% margin
    expect(calculateMargin(200, 100)).toBe(100)
  })

  it('should handle zero cost price', () => {
    expect(calculateMargin(100, 0)).toBe(0)
  })

  it('should handle same cost and sale price', () => {
    expect(calculateMargin(100, 100)).toBe(0)
  })

  it('should handle negative margins (selling below cost)', () => {
    // Cost 100, sell for 80 = -20% margin
    expect(calculateMargin(80, 100)).toBe(-20)
  })

  it('should round to 2 decimal places', () => {
    // Cost 3, sell for 10 = 233.333...% margin
    expect(calculateMargin(10, 3)).toBe(233.33)
  })
})

describe('calculateProfit', () => {
  it('should calculate profit correctly', () => {
    expect(calculateProfit(1000, 600)).toBe(400)
    expect(calculateProfit(100, 100)).toBe(0)
  })

  it('should handle losses (negative profit)', () => {
    expect(calculateProfit(500, 700)).toBe(-200)
  })

  it('should handle zero values', () => {
    expect(calculateProfit(0, 0)).toBe(0)
    expect(calculateProfit(100, 0)).toBe(100)
    expect(calculateProfit(0, 100)).toBe(-100)
  })
})

describe('calculateAverage', () => {
  it('should calculate average correctly', () => {
    expect(calculateAverage(100, 4)).toBe(25)
    expect(calculateAverage(1000, 10)).toBe(100)
  })

  it('should handle division by zero', () => {
    expect(calculateAverage(100, 0)).toBe(0)
    expect(calculateAverage(0, 0)).toBe(0)
  })

  it('should handle decimal results', () => {
    expect(calculateAverage(100, 3)).toBeCloseTo(33.333, 2)
  })
})

describe('calculateBarProfit', () => {
  it('should calculate bar profit', () => {
    expect(calculateBarProfit(1000, 400)).toBe(600)
    expect(calculateBarProfit(500, 200)).toBe(300)
  })

  it('should handle loss scenarios', () => {
    expect(calculateBarProfit(300, 400)).toBe(-100)
  })

  it('should handle zero values', () => {
    expect(calculateBarProfit(0, 0)).toBe(0)
    expect(calculateBarProfit(100, 0)).toBe(100)
  })
})

describe('calculateAdjustedTicketRevenue', () => {
  it('should return full revenue when not 50/50', () => {
    expect(calculateAdjustedTicketRevenue(1000, false)).toBe(1000)
  })

  it('should return half revenue for 50/50 shows', () => {
    expect(calculateAdjustedTicketRevenue(1000, true)).toBe(500)
    expect(calculateAdjustedTicketRevenue(300, true)).toBe(150)
  })

  it('should handle zero revenue', () => {
    expect(calculateAdjustedTicketRevenue(0, false)).toBe(0)
    expect(calculateAdjustedTicketRevenue(0, true)).toBe(0)
  })
})

describe('calculateTotalShowRevenue', () => {
  it('should calculate total revenue for regular shows', () => {
    expect(calculateTotalShowRevenue(500, 300, false)).toBe(800)
    expect(calculateTotalShowRevenue(1000, 500, false)).toBe(1500)
  })

  it('should calculate total revenue for 50/50 shows', () => {
    // 50% of 500 = 250, plus 300 bar = 550
    expect(calculateTotalShowRevenue(500, 300, true)).toBe(550)
  })

  it('should default to non-50/50 when flag is omitted', () => {
    expect(calculateTotalShowRevenue(500, 300)).toBe(800)
  })

  it('should handle zero values', () => {
    expect(calculateTotalShowRevenue(0, 0)).toBe(0)
    expect(calculateTotalShowRevenue(0, 100)).toBe(100)
    expect(calculateTotalShowRevenue(100, 0)).toBe(100)
  })
})

describe('calculateComandaTotal', () => {
  it('should calculate total with discount', () => {
    expect(calculateComandaTotal(100, 10)).toBe(90)
    expect(calculateComandaTotal(50, 5)).toBe(45)
  })

  it('should never return negative values', () => {
    expect(calculateComandaTotal(100, 150)).toBe(0)
    expect(calculateComandaTotal(10, 100)).toBe(0)
  })

  it('should handle zero discount', () => {
    expect(calculateComandaTotal(100, 0)).toBe(100)
  })

  it('should handle exact discount', () => {
    expect(calculateComandaTotal(100, 100)).toBe(0)
  })
})

describe('calculateStockValue', () => {
  it('should calculate stock value correctly', () => {
    expect(calculateStockValue(10, 5)).toBe(50)
    expect(calculateStockValue(100, 2.5)).toBe(250)
  })

  it('should handle zero quantity', () => {
    expect(calculateStockValue(0, 100)).toBe(0)
  })

  it('should handle zero price', () => {
    expect(calculateStockValue(100, 0)).toBe(0)
  })

  it('should handle decimal quantities', () => {
    expect(calculateStockValue(1.5, 10)).toBe(15)
  })
})

describe('isLowStock', () => {
  it('should return true when stock is at minimum', () => {
    expect(isLowStock(10, 10)).toBe(true)
  })

  it('should return true when stock is below minimum', () => {
    expect(isLowStock(5, 10)).toBe(true)
    expect(isLowStock(0, 10)).toBe(true)
  })

  it('should return false when stock is above minimum', () => {
    expect(isLowStock(15, 10)).toBe(false)
    expect(isLowStock(11, 10)).toBe(false)
  })

  it('should handle zero minimum', () => {
    expect(isLowStock(0, 0)).toBe(true)
    expect(isLowStock(1, 0)).toBe(false)
  })
})

describe('getTransactionQuantityAdjustment', () => {
  it('should return positive for purchases (compra)', () => {
    expect(getTransactionQuantityAdjustment('compra', 10)).toBe(10)
    expect(getTransactionQuantityAdjustment('compra', -10)).toBe(10)
  })

  it('should return negative for sales (venda)', () => {
    expect(getTransactionQuantityAdjustment('venda', 10)).toBe(-10)
    expect(getTransactionQuantityAdjustment('venda', -10)).toBe(-10)
  })

  it('should return negative for losses (perda)', () => {
    expect(getTransactionQuantityAdjustment('perda', 5)).toBe(-5)
    expect(getTransactionQuantityAdjustment('perda', -5)).toBe(-5)
  })

  it('should preserve sign for adjustments (ajuste)', () => {
    expect(getTransactionQuantityAdjustment('ajuste', 10)).toBe(10)
    expect(getTransactionQuantityAdjustment('ajuste', -10)).toBe(-10)
  })

  it('should preserve sign for transfers (transferencia)', () => {
    expect(getTransactionQuantityAdjustment('transferencia', 10)).toBe(10)
    expect(getTransactionQuantityAdjustment('transferencia', -10)).toBe(-10)
  })
})
