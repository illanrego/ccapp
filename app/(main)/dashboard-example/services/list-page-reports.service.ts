import { db } from "@/db";
import { reportsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type Report = {
    id: string;
    pageId: string;
    method: string;
    createdAt: Date;
    // Add other report fields as needed
};

export async function listPageReportsService(pageId: string): Promise<Report[]> {
    const reports = await db
        .select({
            id: reportsTable.id,
            pageId: reportsTable.pageId,
            method: reportsTable.method,
            createdAt: reportsTable.createdAt,
        })
        .from(reportsTable)
        .where(eq(reportsTable.pageId, pageId))
        .orderBy(desc(reportsTable.createdAt));

    return reports;
} 