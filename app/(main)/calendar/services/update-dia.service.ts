import { db } from "@/db";
import { diasTable, comicsDiasTable, InsertDia, comicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateDiaService(id: number, dia: Omit<InsertDia, 'id'>, comicIds: string[]) {
    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = new Date(dia.date).toISOString().split('T')[0];
    
    // Update the dia
    await db.update(diasTable)
        .set({
            date: formattedDate,
            showName: dia.showName,
            ticketsSold: dia.ticketsSold,
            ticketsRevenue: dia.ticketsRevenue,
            barRevenue: dia.barRevenue,
            showQuality: dia.showQuality,
        })
        .where(eq(diasTable.id, id));

    // Handle comic relationships
    // First delete all existing relationships
    await db.delete(comicsDiasTable)
        .where(eq(comicsDiasTable.diaId, id));

    // Then create new relationships if any comics were provided
    if (comicIds.length > 0) {
        await db.insert(comicsDiasTable).values(
            comicIds.map(comicId => ({
                diaId: id,
                comicId,
            }))
        );
    }

    // Get the updated dia
    const updatedDia = await db.query.diasTable.findFirst({
        where: eq(diasTable.id, id),
    });

    if (!updatedDia) {
        throw new Error(`Dia with id ${id} not found`);
    }

    // Fetch the comics for the updated dia
    const comicRelations = await db
        .select({
            comic: comicsTable,
        })
        .from(comicsDiasTable)
        .innerJoin(comicsTable, eq(comicsDiasTable.comicId, comicsTable.id))
        .where(eq(comicsDiasTable.diaId, id));
    
    const comics = comicRelations.map(relation => relation.comic);

    return {
        dia: updatedDia,
        comics
    };
} 