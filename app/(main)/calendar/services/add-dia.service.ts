import { db } from "@/db";
import { diasTable, comicsDiasTable, InsertDia, comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addDiaService(dia: Omit<InsertDia, 'id'>, comicIds: string[]) {
    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = new Date(dia.date).toISOString().split('T')[0];
    
    // Insert the dia first
    const [newDia] = await db.insert(diasTable).values({
        date: formattedDate,
        showName: dia.showName,
        ticketsSold: dia.ticketsSold,
        ticketsRevenue: dia.ticketsRevenue,
        barRevenue: dia.barRevenue,
        showQuality: dia.showQuality,
    }).returning();

    // Then create the comic relationships if any comics were provided
    if (comicIds.length > 0) {
        await db.insert(comicsDiasTable).values(
            comicIds.map(comicId => ({
                diaId: newDia.id,
                comicId,
            }))
        );
    }

    // Fetch the comics for the new dia
    const comicRelations = await db
        .select({
            comic: comicsTable,
        })
        .from(comicsDiasTable)
        .innerJoin(comicsTable, eq(comicsDiasTable.comicId, comicsTable.id))
        .where(eq(comicsDiasTable.diaId, newDia.id));
    
    const comics = comicRelations.map(relation => relation.comic);

    return {
        dia: newDia,
        comics
    };
} 