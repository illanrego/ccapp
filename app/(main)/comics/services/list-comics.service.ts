import { db } from "@/db";
import { comicsTable, showsTable, comicsShowsTable } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { ComicWithAvgTickets } from "../actions/list-comics.action";

export async function listComicsService(): Promise<ComicWithAvgTickets[]> {
    const comicsWithAvgTickets = await db
        .select({
            id: comicsTable.id,
            name: comicsTable.name,
            picUrl: comicsTable.picUrl,
            city: comicsTable.city,
            socialMedia: comicsTable.socialMedia,
            class: comicsTable.class,
            time: comicsTable.time,
            avgTicketsSold: sql<number>`COALESCE(AVG(${showsTable.ticketsSold}), 0)`.as('avg_tickets_sold')
        })
        .from(comicsTable)
        .leftJoin(
            comicsShowsTable,
            sql`${comicsShowsTable.comicId} = ${comicsTable.id}`
        )
        .leftJoin(
            showsTable,
            sql`${showsTable.id} = ${comicsShowsTable.showId}`
        )
        .groupBy(comicsTable.id)
        .orderBy(
            desc(comicsTable.class),
            desc(sql`avg_tickets_sold`),
            comicsTable.name
        );

    return comicsWithAvgTickets.map(comic => ({
        ...comic,
        avgTicketsSold: Number(comic.avgTicketsSold)
    }));
} 