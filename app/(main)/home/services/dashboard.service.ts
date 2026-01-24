import { db } from "@/db";
import { 
    showsTable, 
    comicsTable,
    comicsShowsTable,
    stockItemsTable, 
    barSessionsTable, 
    comandasTable,
    comandaItemsTable,
} from "@/db/schema";
import { eq, sql, desc, gte, lte, and, count } from "drizzle-orm";

export interface DashboardStats {
    // Shows
    totalShows: number;
    upcomingShows: number;
    recentShowsCount: number;
    
    // Comics
    totalComics: number;
    topComics: { name: string; avgTickets: number; class: string | null }[];
    
    // Stock
    totalStockItems: number;
    lowStockCount: number;
    stockValue: number;
    stockCost: number;
    
    // Bar
    hasActiveSession: boolean;
    activeSessionShow: string | null;
    todayRevenue: number;
    
    // Financial summary (last 30 days)
    last30DaysRevenue: number;
    last30DaysTickets: number;
    last30DaysBarRevenue: number;
    last30DaysBarProfit: number;
    averagePerShow: number;
    
    // Recent shows for chart
    recentShows: {
        date: string;
        showName: string | null;
        ticketsRevenue: number;
        barRevenue: number;
        totalRevenue: number;
    }[];
    
    // Top selling items
    topSellingItems: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
}

export async function getDashboardStatsService(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get total shows
    const [showsCount] = await db
        .select({ count: count() })
        .from(showsTable);

    // Get upcoming shows (date >= today)
    const [upcomingCount] = await db
        .select({ count: count() })
        .from(showsTable)
        .where(gte(showsTable.date, today));

    // Get recent shows count (last 30 days)
    const [recentCount] = await db
        .select({ count: count() })
        .from(showsTable)
        .where(and(
            gte(showsTable.date, thirtyDaysAgo),
            lte(showsTable.date, today)
        ));

    // Get total comics
    const [comicsCount] = await db
        .select({ count: count() })
        .from(comicsTable);

    // Get top comics by average tickets
    const topComics = await db
        .select({
            name: comicsTable.name,
            class: comicsTable.class,
            avgTickets: sql<number>`COALESCE(AVG(${showsTable.ticketsSold}), 0)`.as('avg_tickets'),
        })
        .from(comicsTable)
        .leftJoin(comicsShowsTable, eq(comicsTable.id, comicsShowsTable.comicId))
        .leftJoin(showsTable, eq(comicsShowsTable.showId, showsTable.id))
        .groupBy(comicsTable.id, comicsTable.name, comicsTable.class)
        .orderBy(desc(sql`avg_tickets`))
        .limit(5);

    // Get stock stats
    const stockItems = await db
        .select({
            currentQuantity: stockItemsTable.currentQuantity,
            minQuantity: stockItemsTable.minQuantity,
            costPrice: stockItemsTable.costPrice,
            salePrice: stockItemsTable.salePrice,
            isActive: stockItemsTable.isActive,
        })
        .from(stockItemsTable)
        .where(eq(stockItemsTable.isActive, true));

    const totalStockItems = stockItems.length;
    let lowStockCount = 0;
    let stockValue = 0;
    let stockCost = 0;

    stockItems.forEach(item => {
        const qty = parseFloat(item.currentQuantity);
        const minQty = parseFloat(item.minQuantity || '0');
        const cost = parseFloat(item.costPrice);
        const sale = parseFloat(item.salePrice);
        
        if (qty <= minQty) lowStockCount++;
        stockValue += qty * sale;
        stockCost += qty * cost;
    });

    // Get active bar session
    const [activeSession] = await db
        .select({
            id: barSessionsTable.id,
            showName: showsTable.showName,
            showDate: showsTable.date,
            totalRevenue: barSessionsTable.totalRevenue,
        })
        .from(barSessionsTable)
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(eq(barSessionsTable.status, 'aberto'))
        .limit(1);

    // Get today's revenue from bar
    const [todayBarRevenue] = await db
        .select({
            total: sql<string>`COALESCE(SUM(${barSessionsTable.totalRevenue}), 0)`,
        })
        .from(barSessionsTable)
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(eq(showsTable.date, today));

    // Get last 30 days financial summary
    const recentShowsData = await db
        .select({
            date: showsTable.date,
            showName: showsTable.showName,
            ticketsSold: showsTable.ticketsSold,
            ticketsRevenue: showsTable.ticketsRevenue,
            barRevenue: barSessionsTable.totalRevenue,
            barCost: barSessionsTable.totalCost,
        })
        .from(showsTable)
        .leftJoin(barSessionsTable, eq(showsTable.id, barSessionsTable.showId))
        .where(and(
            gte(showsTable.date, thirtyDaysAgo),
            lte(showsTable.date, today)
        ))
        .orderBy(desc(showsTable.date))
        .limit(10);

    let last30DaysRevenue = 0;
    let last30DaysTickets = 0;
    let last30DaysBarRevenue = 0;
    let last30DaysBarProfit = 0;

    const recentShows = recentShowsData.map(show => {
        const ticketsRev = parseFloat(show.ticketsRevenue || '0');
        const barRev = parseFloat(show.barRevenue || '0');
        const barCost = parseFloat(show.barCost || '0');
        
        last30DaysRevenue += ticketsRev + barRev;
        last30DaysTickets += show.ticketsSold || 0;
        last30DaysBarRevenue += barRev;
        last30DaysBarProfit += barRev - barCost;

        return {
            date: show.date,
            showName: show.showName,
            ticketsRevenue: ticketsRev,
            barRevenue: barRev,
            totalRevenue: ticketsRev + barRev,
        };
    });

    const averagePerShow = recentShows.length > 0 ? last30DaysRevenue / recentShows.length : 0;

    // Get top selling items (last 30 days)
    const topItems = await db
        .select({
            name: stockItemsTable.name,
            quantity: sql<number>`COALESCE(SUM(${comandaItemsTable.quantity}), 0)`,
            revenue: sql<string>`COALESCE(SUM(${comandaItemsTable.total}), 0)`,
        })
        .from(comandaItemsTable)
        .innerJoin(stockItemsTable, eq(comandaItemsTable.stockItemId, stockItemsTable.id))
        .innerJoin(comandasTable, eq(comandaItemsTable.comandaId, comandasTable.id))
        .innerJoin(barSessionsTable, eq(comandasTable.sessionId, barSessionsTable.id))
        .innerJoin(showsTable, eq(barSessionsTable.showId, showsTable.id))
        .where(and(
            eq(comandasTable.status, 'paga'),
            gte(showsTable.date, thirtyDaysAgo)
        ))
        .groupBy(stockItemsTable.id, stockItemsTable.name)
        .orderBy(desc(sql`SUM(${comandaItemsTable.quantity})`))
        .limit(5);

    return {
        totalShows: showsCount.count,
        upcomingShows: upcomingCount.count,
        recentShowsCount: recentCount.count,
        totalComics: comicsCount.count,
        topComics: topComics.map(c => ({
            name: c.name,
            avgTickets: Number(c.avgTickets),
            class: c.class,
        })),
        totalStockItems,
        lowStockCount,
        stockValue,
        stockCost,
        hasActiveSession: !!activeSession,
        activeSessionShow: activeSession 
            ? `${activeSession.showName || 'Show'} (${new Date(activeSession.showDate + 'T00:00:00').toLocaleDateString('pt-BR')})`
            : null,
        todayRevenue: parseFloat(todayBarRevenue?.total || '0'),
        last30DaysRevenue,
        last30DaysTickets,
        last30DaysBarRevenue,
        last30DaysBarProfit,
        averagePerShow,
        recentShows,
        topSellingItems: topItems.map(item => ({
            name: item.name,
            quantity: Number(item.quantity),
            revenue: parseFloat(item.revenue),
        })),
    };
}

