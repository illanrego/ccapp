import { db } from "@/db";
import { comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteComicService(id: string) {
    return await db.delete(comicsTable).where(eq(comicsTable.id, id));
} 