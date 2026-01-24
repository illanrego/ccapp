import { db } from "@/db";
import { 
    showsTable, 
    barSessionsTable, 
    comandasTable,
    comandaItemsTable,
    stockItemsTable,
    stockTransactionsTable 
} from "@/db/schema";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";

export interface ShowFinancialSummary {
    showId: number;
    date: string;
    showName: string | null;
    ticketsSold: number;
    freeTickets: number;
    ticketsRevenue: number;
    barRevenue: number;
    barCost: number;
    barProfit: number;
    totalRevenue: number;
    isFiftyFifty: boolean;
}

export interface OverallSummary {
    totalShows: number;
    totalTicketsSold: number;
    totalTicketsRevenue: number;
    totalBarRevenue: number;
    totalBarCost: number;
    totalBarProfit: number;
    totalRevenue: number;
    averagePerShow: number;
    averageBarPerPerson: number;
}

export interface PaymentMethodSummary {
    dinheiro: number;
    cartao: number;
    pix: number;
}

export interface TopSellingItem {
    itemId: number;
    itemName: string;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
}

// Get financial summary for all shows
export async function getShowsFinancialSummaryService(
    startDate?: string,
    endDate?: string
): Promise<ShowFinancialSummary[]> {
    const conditions = [];
    if (startDate) {
        conditions.push(gte(showsTable.date, startDate));
    }
    if (endDate) {
        conditions.push(lte(showsTable.date, endDate));
    }

    const shows = await db
        .select({
            showId: showsTable.id,
            date: showsTable.date,
            showName: showsTable.showName,
            ticketsSold: showsTable.ticketsSold,
            freeTickets: showsTable.freeTickets,
            ticketsRevenue: showsTable.ticketsRevenue,
            isFiftyFifty: showsTable.isFiftyFifty,
            barRevenue: barSessionsTable.totalRevenue,
            barCost: barSessionsTable.totalCost,
        })
        .from(showsTable)
        .leftJoin(barSessionsTable, eq(showsTable.id, barSessionsTable.showId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(showsTable.date));

    return shows.map(show => {
        const ticketsRevenue = parseFloat(show.ticketsRevenue || '0');
        const barRevenue = parseFloat(show.barRevenue || '0');
        const barCost = parseFloat(show.barCost || '0');
        const barProfit = barRevenue - barCost;

        return {
            showId: show.showId,
            date: show.date,
            showName: show.showName,
            ticketsSold: show.ticketsSold || 0,
            freeTickets: show.freeTickets || 0,
            ticketsRevenue,
            barRevenue,
            barCost,
            barProfit,
            totalRevenue: ticketsRevenue + barRevenue,
            isFiftyFifty: show.isFiftyFifty || false,
        };
    });
}

// Get overall summary
export async function getOverallSummaryService(
    startDate?: string,
    endDate?: string
): Promise<OverallSummary> {
    const shows = await getShowsFinancialSummaryService(startDate, endDate);

    const totalShows = shows.length;
    const totalTicketsSold = shows.reduce((sum, s) => sum + s.ticketsSold, 0);
    const totalTicketsRevenue = shows.reduce((sum, s) => sum + s.ticketsRevenue, 0);
    const totalBarRevenue = shows.reduce((sum, s) => sum + s.barRevenue, 0);
    const totalBarCost = shows.reduce((sum, s) => sum + s.barCost, 0);
    const totalBarProfit = totalBarRevenue - totalBarCost;
    const totalRevenue = totalTicketsRevenue + totalBarRevenue;
    const totalPeople = shows.reduce((sum, s) => sum + s.ticketsSold + s.freeTickets, 0);

    return {
        totalShows,
        totalTicketsSold,
        totalTicketsRevenue,
        totalBarRevenue,
        totalBarCost,
        totalBarProfit,
        totalRevenue,
        averagePerShow: totalShows > 0 ? totalRevenue / totalShows : 0,
        averageBarPerPerson: totalPeople > 0 ? totalBarRevenue / totalPeople : 0,
    };
}

// Get payment method breakdown
export async function getPaymentMethodSummaryService(
    startDate?: string,
    endDate?: string
): Promise<PaymentMethodSummary> {
    // We need to join with bar_sessions and shows to filter by date
    const result = await db
        .select({
            paymentMethod: comandasTable.paymentMethod,
            total: sql<string>`COALESCE(SUM(${comandasTable.total}), 0)`,
        })
        .from(comandasTable)
        .innerJoin(barSessionsTable, eq(comandasTable.sessionId, barSessionsTable.id))
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(and(
            eq(comandasTable.status, 'paga'),
            startDate ? gte(showsTable.date, startDate) : undefined,
            endDate ? lte(showsTable.date, endDate) : undefined
        ))
        .groupBy(comandasTable.paymentMethod);

    const summary: PaymentMethodSummary = {
        dinheiro: 0,
        cartao: 0,
        pix: 0,
    };

    result.forEach(row => {
        if (row.paymentMethod && row.paymentMethod in summary) {
            summary[row.paymentMethod as keyof PaymentMethodSummary] = parseFloat(row.total);
        }
    });

    return summary;
}

// Get top selling items
export async function getTopSellingItemsService(
    limit: number = 10,
    startDate?: string,
    endDate?: string
): Promise<TopSellingItem[]> {
    const result = await db
        .select({
            itemId: comandaItemsTable.stockItemId,
            itemName: stockItemsTable.name,
            totalQuantity: sql<number>`COALESCE(SUM(${comandaItemsTable.quantity}), 0)`,
            totalRevenue: sql<string>`COALESCE(SUM(${comandaItemsTable.total}), 0)`,
            totalCost: sql<string>`COALESCE(SUM(${comandaItemsTable.unitCost}::numeric * ${comandaItemsTable.quantity}), 0)`,
        })
        .from(comandaItemsTable)
        .innerJoin(stockItemsTable, eq(comandaItemsTable.stockItemId, stockItemsTable.id))
        .innerJoin(comandasTable, eq(comandaItemsTable.comandaId, comandasTable.id))
        .innerJoin(barSessionsTable, eq(comandasTable.sessionId, barSessionsTable.id))
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(and(
            eq(comandasTable.status, 'paga'),
            startDate ? gte(showsTable.date, startDate) : undefined,
            endDate ? lte(showsTable.date, endDate) : undefined
        ))
        .groupBy(comandaItemsTable.stockItemId, stockItemsTable.name)
        .orderBy(desc(sql`SUM(${comandaItemsTable.quantity})`))
        .limit(limit);

    return result.map(row => ({
        itemId: row.itemId,
        itemName: row.itemName,
        totalQuantity: Number(row.totalQuantity),
        totalRevenue: parseFloat(row.totalRevenue),
        totalProfit: parseFloat(row.totalRevenue) - parseFloat(row.totalCost),
    }));
}

// Get stock purchase costs
export async function getStockPurchaseCostsService(
    startDate?: string,
    endDate?: string
): Promise<number> {
    const result = await db
        .select({
            totalCost: sql<string>`COALESCE(SUM(ABS(${stockTransactionsTable.totalCost}::numeric)), 0)`,
        })
        .from(stockTransactionsTable)
        .where(and(
            eq(stockTransactionsTable.type, 'compra'),
            startDate ? gte(sql`DATE(${stockTransactionsTable.createdAt})`, startDate) : undefined,
            endDate ? lte(sql`DATE(${stockTransactionsTable.createdAt})`, endDate) : undefined
        ));

    return parseFloat(result[0]?.totalCost || '0');
}

