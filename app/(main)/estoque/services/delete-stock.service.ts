import { db } from "@/db";
import { stockItemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteStockService(id: number) {
    return await db.delete(stockItemsTable).where(eq(stockItemsTable.id, id));
}

