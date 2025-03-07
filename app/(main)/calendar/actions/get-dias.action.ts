'use server'

import { db } from "@/db";
import { diasTable, comicsTable, comicsDiasTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDias() {
  // First, get all dias
  const dias = await db.select().from(diasTable);
  
  // Then for each dia, get the associated comics
  const result = await Promise.all(
    dias.map(async (dia) => {
      const comicRelations = await db
        .select({
          comic: comicsTable,
        })
        .from(comicsDiasTable)
        .innerJoin(comicsTable, eq(comicsDiasTable.comicId, comicsTable.id))
        .where(eq(comicsDiasTable.diaId, dia.id));
      
      const comics = comicRelations.map(relation => relation.comic);
      
      return {
        dia,
        comics: comics || [],
      };
    })
  );

  return result;
} 