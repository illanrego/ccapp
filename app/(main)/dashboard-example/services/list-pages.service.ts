import { db } from "@/db";
import { pagesTable } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export type SortField = 'url' | 'keyword' | 'createdAt' | 'lastAnalysisDate';
export type SortOrder = 'asc' | 'desc';

export type Page = {
    id: string;
    userId?: string | null;
    url: string;
    keyword: string;
    createdAt: Date;
    lastAnalysisDate: Date | null;
}
  
export async function listPagesService(userId: string, sortField: SortField, sortOrder: SortOrder): Promise<Page[]> {
    const query = db
        .select({
            id: pagesTable.id,
            userId: pagesTable.userId,
            url: pagesTable.url,
            keyword: pagesTable.keyword,
            createdAt: pagesTable.createdAt,
            lastAnalysisDate: pagesTable.lastAnalysisDate,
        })
        .from(pagesTable)
        .where(eq(pagesTable.userId, userId))
        .orderBy(sortOrder === 'desc' ? desc(pagesTable[sortField]) : asc(pagesTable[sortField]));

    return query;
}