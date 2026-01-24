import { db } from "@/db";
import { stockItemsTable, SelectStockItem } from "@/db/schema";
import { asc } from "drizzle-orm";

export interface StockItemWithStats extends SelectStockItem {
    margin: number; // Profit margin percentage
    isLowStock: boolean; // Below min quantity
}

export async function listStockService(): Promise<StockItemWithStats[]> {
    const items = await db
        .select()
        .from(stockItemsTable)
        .orderBy(
            asc(stockItemsTable.category),
            asc(stockItemsTable.name)
        );

    return items.map(item => {
        const costPrice = parseFloat(item.costPrice);
        const salePrice = parseFloat(item.salePrice);
        const currentQty = parseFloat(item.currentQuantity);
        const minQty = item.minQuantity ? parseFloat(item.minQuantity) : 0;
        
        // Calculate margin: ((sale - cost) / cost) * 100
        const margin = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;
        
        return {
            ...item,
            margin: Math.round(margin * 100) / 100,
            isLowStock: currentQty <= minQty,
        };
    });
}

