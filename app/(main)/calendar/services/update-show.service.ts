import { db } from "@/db";
import { showsTable, comicsShowsTable, InsertShow, comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateShowService(id: number, show: Omit<InsertShow, 'id'>, comicIds: string[]) {
    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = new Date(show.date).toISOString().split('T')[0];
    
    // Update the show first
    const [updatedShow] = await db.update(showsTable)
        .set({
            date: formattedDate,
            startTime: show.startTime,
            showName: show.showName,
            ticketsSold: show.ticketsSold,
            ticketsRevenue: show.ticketsRevenue,
            barRevenue: show.barRevenue,
            showQuality: show.showQuality,
        })
        .where(eq(showsTable.id, id))
        .returning();

    // Delete all existing comic relationships for this show
    await db.delete(comicsShowsTable)
        .where(eq(comicsShowsTable.showId, id));

    // Then create the new comic relationships if any comics were provided
    if (comicIds.length > 0) {
        await db.insert(comicsShowsTable).values(
            comicIds.map(comicId => ({
                showId: id,
                comicId,
            }))
        );
    }

    // Fetch the comics for the updated show
    const comicRelations = await db
        .select({
            comic: comicsTable,
        })
        .from(comicsShowsTable)
        .innerJoin(comicsTable, eq(comicsShowsTable.comicId, comicsTable.id))
        .where(eq(comicsShowsTable.showId, id));
    
    const comics = comicRelations.map(relation => relation.comic);

    return {
        show: updatedShow,
        comics
    };
} 