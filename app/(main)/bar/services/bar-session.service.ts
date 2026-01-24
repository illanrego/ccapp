import { db } from "@/db";
import { barSessionsTable, comandasTable, showsTable, SelectBarSession, SelectShow } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";

export interface BarSessionWithShow extends SelectBarSession {
    show: SelectShow;
}

// Get active (open) bar session
export async function getActiveBarSessionService(): Promise<BarSessionWithShow | null> {
    const [session] = await db
        .select({
            id: barSessionsTable.id,
            showId: barSessionsTable.showId,
            status: barSessionsTable.status,
            totalRevenue: barSessionsTable.totalRevenue,
            totalCost: barSessionsTable.totalCost,
            openedAt: barSessionsTable.openedAt,
            closedAt: barSessionsTable.closedAt,
            show: showsTable,
        })
        .from(barSessionsTable)
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(eq(barSessionsTable.status, 'aberto'))
        .limit(1);

    if (!session) return null;

    return {
        id: session.id,
        showId: session.showId,
        status: session.status,
        totalRevenue: session.totalRevenue,
        totalCost: session.totalCost,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        show: session.show,
    };
}

// Get unclosed sessions from previous shows (for cleanup prompt)
export async function getUnclosedPreviousSessionService(currentShowId?: number): Promise<BarSessionWithShow | null> {
    const conditions = [eq(barSessionsTable.status, 'aberto')];
    if (currentShowId) {
        conditions.push(ne(barSessionsTable.showId, currentShowId));
    }

    const [session] = await db
        .select({
            id: barSessionsTable.id,
            showId: barSessionsTable.showId,
            status: barSessionsTable.status,
            totalRevenue: barSessionsTable.totalRevenue,
            totalCost: barSessionsTable.totalCost,
            openedAt: barSessionsTable.openedAt,
            closedAt: barSessionsTable.closedAt,
            show: showsTable,
        })
        .from(barSessionsTable)
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(and(...conditions))
        .orderBy(desc(barSessionsTable.openedAt))
        .limit(1);

    if (!session) return null;

    return {
        id: session.id,
        showId: session.showId,
        status: session.status,
        totalRevenue: session.totalRevenue,
        totalCost: session.totalCost,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        show: session.show,
    };
}

// Open a new bar session for a show
export async function openBarSessionService(showId: number): Promise<SelectBarSession> {
    return await db.transaction(async (tx) => {
        // Create the session
        const [session] = await tx.insert(barSessionsTable)
            .values({ showId })
            .returning();

        // Create 50 comandas
        const comandas = Array.from({ length: 50 }, (_, i) => ({
            sessionId: session.id,
            number: i + 1,
            status: 'disponivel' as const,
        }));

        await tx.insert(comandasTable).values(comandas);

        return session;
    });
}

// Close a bar session
export async function closeBarSessionService(sessionId: number): Promise<void> {
    await db.update(barSessionsTable)
        .set({
            status: 'fechado',
            closedAt: new Date(),
        })
        .where(eq(barSessionsTable.id, sessionId));
}

// Get session by ID with show
export async function getBarSessionByIdService(sessionId: number): Promise<BarSessionWithShow | null> {
    const [session] = await db
        .select({
            id: barSessionsTable.id,
            showId: barSessionsTable.showId,
            status: barSessionsTable.status,
            totalRevenue: barSessionsTable.totalRevenue,
            totalCost: barSessionsTable.totalCost,
            openedAt: barSessionsTable.openedAt,
            closedAt: barSessionsTable.closedAt,
            show: showsTable,
        })
        .from(barSessionsTable)
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(eq(barSessionsTable.id, sessionId))
        .limit(1);

    if (!session) return null;

    return {
        id: session.id,
        showId: session.showId,
        status: session.status,
        totalRevenue: session.totalRevenue,
        totalCost: session.totalCost,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        show: session.show,
    };
}

// Update session totals
export async function updateBarSessionTotalsService(sessionId: number, revenue: number, cost: number): Promise<void> {
    await db.update(barSessionsTable)
        .set({
            totalRevenue: revenue.toFixed(2),
            totalCost: cost.toFixed(2),
        })
        .where(eq(barSessionsTable.id, sessionId));
}

