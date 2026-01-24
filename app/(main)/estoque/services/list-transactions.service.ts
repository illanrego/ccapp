import { db } from "@/db";
import { stockItemsTable, stockTransactionsTable, SelectStockTransaction } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export interface TransactionWithItem extends SelectStockTransaction {
    itemName: string;
}

export async function listTransactionsService(itemId?: number): Promise<TransactionWithItem[]> {
    const query = db
        .select({
            id: stockTransactionsTable.id,
            itemId: stockTransactionsTable.itemId,
            type: stockTransactionsTable.type,
            quantity: stockTransactionsTable.quantity,
            unitCost: stockTransactionsTable.unitCost,
            totalCost: stockTransactionsTable.totalCost,
            showId: stockTransactionsTable.showId,
            notes: stockTransactionsTable.notes,
            createdAt: stockTransactionsTable.createdAt,
            itemName: stockItemsTable.name,
        })
        .from(stockTransactionsTable)
        .innerJoin(stockItemsTable, eq(stockTransactionsTable.itemId, stockItemsTable.id))
        .orderBy(desc(stockTransactionsTable.createdAt));

    if (itemId) {
        return await query.where(eq(stockTransactionsTable.itemId, itemId));
    }

    return await query;
}

