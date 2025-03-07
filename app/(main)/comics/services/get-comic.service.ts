import { db } from "@/db";
import { comicsTable, diasTable, comicsDiasTable, SelectComic, SelectDia } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type ComicWithDias = SelectComic & {
    dias?: (SelectDia & { comicDia: { comicId: string; diaId: number } })[];
};

export async function getComicWithDiasService(id: string): Promise<ComicWithDias | null> {
    // First get the comic
    const comic = await db.query.comicsTable.findFirst({
        where: eq(comicsTable.id, id),
    });

    if (!comic) {
        return null;
    }

    // Then get the dias related to this comic
    const dias = await db
        .select({
            dia: diasTable,
            comicDia: comicsDiasTable,
        })
        .from(diasTable)
        .innerJoin(comicsDiasTable, eq(diasTable.id, comicsDiasTable.diaId))
        .where(eq(comicsDiasTable.comicId, id))
        .orderBy(desc(diasTable.date));

    // Transform the result to the expected format
    return {
        ...comic,
        dias: dias.map(({ dia, comicDia }) => ({
            ...dia,
            comicDia,
        })),
    };
} 