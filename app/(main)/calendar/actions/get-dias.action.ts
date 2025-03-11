'use server'

import { db } from "@/db";
import { showsTable, comicsTable, comicsShowsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getShows() {
  // First, get all shows
  const shows = await db.select().from(showsTable);
  
  // Then for each show, get the associated comics
  const result = await Promise.all(
    shows.map(async (show) => {
      const comicRelations = await db
        .select({
          comic: comicsTable,
        })
        .from(comicsShowsTable)
        .innerJoin(comicsTable, eq(comicsShowsTable.comicId, comicsTable.id))
        .where(eq(comicsShowsTable.showId, show.id));
      
      const comics = comicRelations.map(relation => relation.comic);
      
      return {
        show,
        comics: comics || [],
      };
    })
  );

  return result;
}

// Keep the old function for backward compatibility
export async function getDias() {
  return getShows();
} 