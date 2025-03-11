import { db } from "@/db";
import { showsTable, comicsShowsTable, InsertShow, comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ComicWithPosition {
    id: string;
    position: string | null;
}

export async function updateShowService(id: number, show: Omit<InsertShow, 'id'>, comicsWithPositions: ComicWithPosition[]) {
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
            isFiftyFifty: show.isFiftyFifty,
        })
        .where(eq(showsTable.id, id))
        .returning();

    // Delete all existing comic relationships for this show
    await db.delete(comicsShowsTable)
        .where(eq(comicsShowsTable.showId, id));

    // Then create the new comic relationships if any comics were provided
    if (comicsWithPositions.length > 0) {
        await db.insert(comicsShowsTable).values(
            comicsWithPositions.map(comic => ({
                showId: id,
                comicId: comic.id,
                position: comic.position,
            }))
        );
    }

    // Fetch the comics for the updated show
    const comicRelations = await db
        .select({
            comic: comicsTable,
            comicShow: comicsShowsTable,
        })
        .from(comicsShowsTable)
        .innerJoin(comicsTable, eq(comicsShowsTable.comicId, comicsTable.id))
        .where(eq(comicsShowsTable.showId, id));
    
    const comics = comicRelations.map(relation => ({
        ...relation.comic,
        comicShow: relation.comicShow,
    }));

    return {
        show: updatedShow,
        comics
    };
} 