import { db } from "@/db";
import { stockItemsTable, InsertStockItem } from "@/db/schema";

export async function addStockService(item: Omit<InsertStockItem, 'id' | 'createdAt' | 'updatedAt'>) {
    return await db.insert(stockItemsTable).values(item).returning();
}

