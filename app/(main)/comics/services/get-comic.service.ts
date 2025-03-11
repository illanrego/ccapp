import { db } from "@/db";
import { comicsTable, showsTable, comicsShowsTable, SelectComic, SelectShow } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type ComicWithShows = SelectComic & {
    shows?: (SelectShow & { comicShow: { comicId: string; showId: number; position?: string | null } })[];
};

export async function getComicWithShowsService(id: string): Promise<ComicWithShows | null> {
    // First get the comic
    const comic = await db.query.comicsTable.findFirst({
        where: eq(comicsTable.id, id),
    });

    if (!comic) {
        return null;
    }

    // Then get the shows related to this comic
    const shows = await db
        .select({
            show: showsTable,
            comicShow: comicsShowsTable,
        })
        .from(showsTable)
        .innerJoin(comicsShowsTable, eq(showsTable.id, comicsShowsTable.showId))
        .where(eq(comicsShowsTable.comicId, id))
        .orderBy(desc(showsTable.date));

    // Transform the result to the expected format
    return {
        ...comic,
        shows: shows.map(({ show, comicShow }) => ({
            ...show,
            comicShow,
        })),
    };
} 