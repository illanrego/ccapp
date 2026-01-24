import { db } from "@/db";
import { showsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteDiaService(id: number) {
    // The comics_shows relationships will be automatically deleted due to ON DELETE CASCADE
    await db.delete(showsTable)
        .where(eq(showsTable.id, id));
} 