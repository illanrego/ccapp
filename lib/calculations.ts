/**
 * Shared calculation utilities for the application
 */

/**
 * Calculates profit margin percentage
 * @param salePrice - The selling price
 * @param costPrice - The cost price
 * @returns Profit margin as percentage (e.g., 50 for 50%)
 */
export function calculateMargin(salePrice: number, costPrice: number): number {
  if (costPrice === 0) return 0
  const margin = ((salePrice - costPrice) / costPrice) * 100
  return Math.round(margin * 100) / 100
}

/**
 * Calculates profit from revenue and cost
 * @param revenue - Total revenue
 * @param cost - Total cost
 * @returns Profit amount
 */
export function calculateProfit(revenue: number, cost: number): number {
  return revenue - cost
}

/**
 * Calculates the average, handling division by zero
 * @param total - The total sum
 * @param count - The count to divide by
 * @returns The average, or 0 if count is 0
 */
export function calculateAverage(total: number, count: number): number {
  if (count === 0) return 0
  return total / count
}

/**
 * Calculates bar profit (60% of bar revenue minus cost)
 * This is the business rule for the comedy club
 * @param barRevenue - Total bar revenue
 * @param barCost - Total bar cost
 * @returns Estimated bar profit
 */
export function calculateBarProfit(barRevenue: number, barCost: number): number {
  return barRevenue - barCost
}

/**
 * Calculates ticket revenue considering 50/50 split
 * @param ticketRevenue - Original ticket revenue
 * @param isFiftyFifty - Whether this is a 50/50 split show
 * @returns Adjusted ticket revenue (50% if split)
 */
export function calculateAdjustedTicketRevenue(
  ticketRevenue: number,
  isFiftyFifty: boolean
): number {
  return isFiftyFifty ? ticketRevenue * 0.5 : ticketRevenue
}

/**
 * Calculates total show revenue
 * @param ticketRevenue - Ticket revenue
 * @param barRevenue - Bar revenue
 * @param isFiftyFifty - Whether this is a 50/50 split show
 * @returns Total revenue (adjusted for 50/50 if applicable)
 */
export function calculateTotalShowRevenue(
  ticketRevenue: number,
  barRevenue: number,
  isFiftyFifty: boolean = false
): number {
  const adjustedTicketRevenue = calculateAdjustedTicketRevenue(ticketRevenue, isFiftyFifty)
  return adjustedTicketRevenue + barRevenue
}

/**
 * Calculates comanda/order total with discount
 * @param subtotal - The subtotal before discount
 * @param discount - The discount amount
 * @returns Final total (never negative)
 */
export function calculateComandaTotal(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - discount)
}

/**
 * Calculates stock value (quantity * price)
 * @param quantity - Number of items
 * @param price - Price per item
 * @returns Total value
 */
export function calculateStockValue(quantity: number, price: number): number {
  return quantity * price
}

/**
 * Checks if stock is below minimum threshold
 * @param currentQuantity - Current stock quantity
 * @param minQuantity - Minimum required quantity
 * @returns True if stock is low
 */
export function isLowStock(currentQuantity: number, minQuantity: number): boolean {
  return currentQuantity <= minQuantity
}

/**
 * Determines the quantity adjustment based on transaction type
 * @param type - Transaction type
 * @param quantity - Original quantity (positive number)
 * @returns Adjusted quantity (positive for additions, negative for removals)
 */
export function getTransactionQuantityAdjustment(
  type: 'compra' | 'venda' | 'ajuste' | 'perda' | 'transferencia',
  quantity: number
): number {
  switch (type) {
    case 'compra':
      return Math.abs(quantity) // Always positive for purchases
    case 'venda':
    case 'perda':
      return -Math.abs(quantity) // Always negative for sales/losses
    case 'ajuste':
    case 'transferencia':
      return quantity // Keep sign as provided
    default:
      return quantity
  }
}
