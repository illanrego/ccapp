import { db } from "@/db";
import { diasTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteDiaService(id: number) {
    // The comics_dias relationships will be automatically deleted due to ON DELETE CASCADE
    await db.delete(diasTable)
        .where(eq(diasTable.id, id));
} 