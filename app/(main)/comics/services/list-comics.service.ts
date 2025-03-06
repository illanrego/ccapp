import { db } from "@/db";
import { comicsTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function listComicsService() {
    const query = db
        .select()
        .from(comicsTable)
        .orderBy(desc(comicsTable.name));

    return query;
} 