import { db } from "@/db";
import { comicsTable, InsertComic } from "@/db/schema";

export async function addComicService(comic: Omit<InsertComic, 'id'>) {
    return await db.insert(comicsTable).values(comic);
} 