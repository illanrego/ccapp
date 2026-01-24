import { db } from "@/db";
import { stockItemsTable, stockTransactionsTable, InsertStockTransaction } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function addTransactionService(
    transaction: Omit<InsertStockTransaction, 'id' | 'createdAt'>
) {
    // Start a transaction to update both the transaction log and stock quantity
    return await db.transaction(async (tx) => {
        // Insert the transaction
        const [newTransaction] = await tx.insert(stockTransactionsTable)
            .values(transaction)
            .returning();

        // Calculate quantity adjustment based on transaction type
        const qty = parseFloat(transaction.quantity);
        let adjustment: number;

        switch (transaction.type) {
            case 'compra': // Purchase - adds to stock
                adjustment = qty;
                break;
            case 'venda': // Sale - removes from stock
            case 'perda': // Waste - removes from stock
                adjustment = -qty;
                break;
            case 'ajuste': // Adjustment - can be positive or negative
            case 'transferencia': // Transfer - can be positive or negative
                adjustment = qty; // Quantity should be entered as signed value
                break;
            default:
                adjustment = 0;
        }

        // Update the stock quantity
        await tx.update(stockItemsTable)
            .set({
                currentQuantity: sql`${stockItemsTable.currentQuantity} + ${adjustment}`,
                updatedAt: new Date(),
            })
            .where(eq(stockItemsTable.id, transaction.itemId));

        return newTransaction;
    });
}

