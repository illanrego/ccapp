import { db } from "@/db";
import { showsTable, comicsShowsTable, InsertShow, comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addShowService(show: Omit<InsertShow, 'id'>, comicIds: string[]) {
    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = new Date(show.date).toISOString().split('T')[0];
    
    // Insert the show first
    const [newShow] = await db.insert(showsTable).values({
        date: formattedDate,
        startTime: show.startTime,
        showName: show.showName,
        ticketsSold: show.ticketsSold,
        ticketsRevenue: show.ticketsRevenue,
        barRevenue: show.barRevenue,
        showQuality: show.showQuality,
        isFiftyFifty: show.isFiftyFifty,
    }).returning();

    // Then create the comic relationships if any comics were provided
    if (comicIds.length > 0) {
        await db.insert(comicsShowsTable).values(
            comicIds.map(comicId => ({
                showId: newShow.id,
                comicId,
            }))
        );
    }

    // Fetch the comics for the new show
    const comicRelations = await db
        .select({
            comic: comicsTable,
        })
        .from(comicsShowsTable)
        .innerJoin(comicsTable, eq(comicsShowsTable.comicId, comicsTable.id))
        .where(eq(comicsShowsTable.showId, newShow.id));
    
    const comics = comicRelations.map(relation => relation.comic);

    return {
        show: newShow,
        comics
    };
} 