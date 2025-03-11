import { db } from "@/db";
import { showsTable, comicsShowsTable, InsertShow, comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ComicWithPosition {
    id: string;
    position: string | null;
}

export async function addShowService(show: Omit<InsertShow, 'id'>, comicsWithPositions: ComicWithPosition[]) {
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
    if (comicsWithPositions.length > 0) {
        await db.insert(comicsShowsTable).values(
            comicsWithPositions.map(comic => ({
                showId: newShow.id,
                comicId: comic.id,
                position: comic.position,
            }))
        );
    }

    // Fetch the comics for the new show
    const comicRelations = await db
        .select({
            comic: comicsTable,
            comicShow: comicsShowsTable,
        })
        .from(comicsShowsTable)
        .innerJoin(comicsTable, eq(comicsShowsTable.comicId, comicsTable.id))
        .where(eq(comicsShowsTable.showId, newShow.id));
    
    const comics = comicRelations.map(relation => ({
        ...relation.comic,
        comicShow: relation.comicShow,
    }));

    return {
        show: newShow,
        comics
    };
} 