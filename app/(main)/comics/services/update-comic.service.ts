import { db } from "@/db";
import { comicsTable, InsertComic } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateComicService(id: string, comic: Omit<InsertComic, 'id'>) {
    return await db.update(comicsTable)
        .set(comic)
        .where(eq(comicsTable.id, id));
} 