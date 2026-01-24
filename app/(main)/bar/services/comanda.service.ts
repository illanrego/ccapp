import { db } from "@/db";
import { 
    comandasTable, 
    comandaItemsTable, 
    stockItemsTable,
    barSessionsTable,
    stockTransactionsTable,
    SelectComanda, 
    SelectComandaItem,
    SelectStockItem 
} from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

export interface ComandaItemWithStock extends SelectComandaItem {
    stockItem: SelectStockItem;
}

export interface ComandaWithItems extends SelectComanda {
    items: ComandaItemWithStock[];
}

// Get all comandas for a session
export async function getComandasBySessionService(sessionId: number): Promise<SelectComanda[]> {
    return await db
        .select()
        .from(comandasTable)
        .where(eq(comandasTable.sessionId, sessionId))
        .orderBy(comandasTable.number);
}

// Get single comanda with items
export async function getComandaWithItemsService(comandaId: number): Promise<ComandaWithItems | null> {
    const [comanda] = await db
        .select()
        .from(comandasTable)
        .where(eq(comandasTable.id, comandaId))
        .limit(1);

    if (!comanda) return null;

    const items = await db
        .select({
            id: comandaItemsTable.id,
            comandaId: comandaItemsTable.comandaId,
            stockItemId: comandaItemsTable.stockItemId,
            quantity: comandaItemsTable.quantity,
            unitPrice: comandaItemsTable.unitPrice,
            unitCost: comandaItemsTable.unitCost,
            total: comandaItemsTable.total,
            createdAt: comandaItemsTable.createdAt,
            stockItem: stockItemsTable,
        })
        .from(comandaItemsTable)
        .innerJoin(stockItemsTable, eq(comandaItemsTable.stockItemId, stockItemsTable.id))
        .where(eq(comandaItemsTable.comandaId, comandaId))
        .orderBy(comandaItemsTable.createdAt);

    return {
        ...comanda,
        items: items.map(item => ({
            id: item.id,
            comandaId: item.comandaId,
            stockItemId: item.stockItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost,
            total: item.total,
            createdAt: item.createdAt,
            stockItem: item.stockItem,
        })),
    };
}

// Open a comanda
export async function openComandaService(comandaId: number, clientName?: string): Promise<SelectComanda> {
    const [comanda] = await db.update(comandasTable)
        .set({
            status: 'aberta',
            clientName: clientName || null,
            openedAt: new Date(),
        })
        .where(eq(comandasTable.id, comandaId))
        .returning();
    
    return comanda;
}

// Add item to comanda
export async function addItemToComandaService(
    comandaId: number,
    stockItemId: number,
    quantity: number
): Promise<void> {
    await db.transaction(async (tx) => {
        // Get stock item for pricing
        const [stockItem] = await tx
            .select()
            .from(stockItemsTable)
            .where(eq(stockItemsTable.id, stockItemId))
            .limit(1);

        if (!stockItem) throw new Error('Item não encontrado');

        const unitPrice = parseFloat(stockItem.salePrice);
        const unitCost = parseFloat(stockItem.costPrice);
        const total = unitPrice * quantity;

        // Check if item already exists in comanda
        const [existingItem] = await tx
            .select()
            .from(comandaItemsTable)
            .where(and(
                eq(comandaItemsTable.comandaId, comandaId),
                eq(comandaItemsTable.stockItemId, stockItemId)
            ))
            .limit(1);

        if (existingItem) {
            // Update existing item
            const newQuantity = existingItem.quantity + quantity;
            const newTotal = unitPrice * newQuantity;
            await tx.update(comandaItemsTable)
                .set({
                    quantity: newQuantity,
                    total: newTotal.toFixed(2),
                })
                .where(eq(comandaItemsTable.id, existingItem.id));
        } else {
            // Insert new item
            await tx.insert(comandaItemsTable).values({
                comandaId,
                stockItemId,
                quantity,
                unitPrice: unitPrice.toFixed(2),
                unitCost: unitCost.toFixed(2),
                total: total.toFixed(2),
            });
        }

        // Update comanda subtotal
        await recalculateComandaTotals(tx, comandaId);
    });
}

// Remove item from comanda
export async function removeItemFromComandaService(itemId: number): Promise<void> {
    await db.transaction(async (tx) => {
        // Get the item to find comanda ID
        const [item] = await tx
            .select()
            .from(comandaItemsTable)
            .where(eq(comandaItemsTable.id, itemId))
            .limit(1);

        if (!item) return;

        // Delete the item
        await tx.delete(comandaItemsTable).where(eq(comandaItemsTable.id, itemId));

        // Recalculate totals
        await recalculateComandaTotals(tx, item.comandaId);
    });
}

// Update item quantity
export async function updateItemQuantityService(itemId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
        return removeItemFromComandaService(itemId);
    }

    await db.transaction(async (tx) => {
        const [item] = await tx
            .select()
            .from(comandaItemsTable)
            .where(eq(comandaItemsTable.id, itemId))
            .limit(1);

        if (!item) return;

        const unitPrice = parseFloat(item.unitPrice);
        const newTotal = unitPrice * quantity;

        await tx.update(comandaItemsTable)
            .set({
                quantity,
                total: newTotal.toFixed(2),
            })
            .where(eq(comandaItemsTable.id, itemId));

        await recalculateComandaTotals(tx, item.comandaId);
    });
}

// Apply discount to comanda
export async function applyDiscountService(comandaId: number, discount: number): Promise<void> {
    await db.transaction(async (tx) => {
        await tx.update(comandasTable)
            .set({ discount: discount.toFixed(2) })
            .where(eq(comandasTable.id, comandaId));

        await recalculateComandaTotals(tx, comandaId);
    });
}

// Close/pay comanda
export async function closeComandaService(
    comandaId: number,
    paymentMethod: 'dinheiro' | 'cartao' | 'pix'
): Promise<void> {
    await db.transaction(async (tx) => {
        // Get comanda with items
        const [comanda] = await tx
            .select()
            .from(comandasTable)
            .where(eq(comandasTable.id, comandaId))
            .limit(1);

        if (!comanda) throw new Error('Comanda não encontrada');

        // Get session to find showId
        const [session] = await tx
            .select()
            .from(barSessionsTable)
            .where(eq(barSessionsTable.id, comanda.sessionId))
            .limit(1);

        if (!session) throw new Error('Sessão não encontrada');

        // Get all items
        const items = await tx
            .select()
            .from(comandaItemsTable)
            .where(eq(comandaItemsTable.comandaId, comandaId));

        // Update stock quantities and create transactions
        for (const item of items) {
            // Decrease stock
            await tx.update(stockItemsTable)
                .set({
                    currentQuantity: sql`${stockItemsTable.currentQuantity} - ${item.quantity}`,
                    updatedAt: new Date(),
                })
                .where(eq(stockItemsTable.id, item.stockItemId));

            // Create stock transaction
            await tx.insert(stockTransactionsTable).values({
                itemId: item.stockItemId,
                type: 'venda',
                quantity: (-item.quantity).toString(),
                unitCost: item.unitCost,
                totalCost: (parseFloat(item.unitCost) * item.quantity).toFixed(2),
                showId: session.showId,
                notes: `Venda comanda #${comanda.number}`,
            });
        }

        // Close the comanda
        await tx.update(comandasTable)
            .set({
                status: 'paga',
                paymentMethod,
                closedAt: new Date(),
            })
            .where(eq(comandasTable.id, comandaId));

        // Update session totals
        await recalculateSessionTotals(tx, comanda.sessionId);
    });
}

// Helper to recalculate comanda totals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateComandaTotals(tx: any, comandaId: number): Promise<void> {
    // Sum all items
    const result = await tx
        .select({
            subtotal: sql<string>`COALESCE(SUM(${comandaItemsTable.total}), 0)`,
        })
        .from(comandaItemsTable)
        .where(eq(comandaItemsTable.comandaId, comandaId));

    const subtotal = parseFloat(result[0]?.subtotal || '0');

    // Get current discount
    const [comanda] = await tx
        .select({ discount: comandasTable.discount })
        .from(comandasTable)
        .where(eq(comandasTable.id, comandaId))
        .limit(1);

    const discount = parseFloat(comanda?.discount || '0');
    const total = Math.max(0, subtotal - discount);

    await tx.update(comandasTable)
        .set({
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
        })
        .where(eq(comandasTable.id, comandaId));
}

// Helper to recalculate session totals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalculateSessionTotals(tx: any, sessionId: number): Promise<void> {
    // Get all paid comandas
    const result = await tx
        .select({
            totalRevenue: sql<string>`COALESCE(SUM(${comandasTable.total}), 0)`,
        })
        .from(comandasTable)
        .where(and(
            eq(comandasTable.sessionId, sessionId),
            eq(comandasTable.status, 'paga')
        ));

    // Get total cost from comanda items
    const costResult = await tx
        .select({
            totalCost: sql<string>`COALESCE(SUM(${comandaItemsTable.unitCost}::numeric * ${comandaItemsTable.quantity}), 0)`,
        })
        .from(comandaItemsTable)
        .innerJoin(comandasTable, eq(comandaItemsTable.comandaId, comandasTable.id))
        .where(and(
            eq(comandasTable.sessionId, sessionId),
            eq(comandasTable.status, 'paga')
        ));

    await tx.update(barSessionsTable)
        .set({
            totalRevenue: result[0]?.totalRevenue || '0',
            totalCost: costResult[0]?.totalCost || '0',
        })
        .where(eq(barSessionsTable.id, sessionId));
}

// Update client name
export async function updateComandaClientNameService(comandaId: number, clientName: string | null): Promise<void> {
    await db.update(comandasTable)
        .set({ clientName })
        .where(eq(comandasTable.id, comandaId));
}

