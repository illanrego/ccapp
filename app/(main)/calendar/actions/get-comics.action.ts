'use server'

import { db } from "@/db";
import { comicsTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getComics() {
  return await db
    .select()
    .from(comicsTable)
    .orderBy(desc(comicsTable.name));
} 