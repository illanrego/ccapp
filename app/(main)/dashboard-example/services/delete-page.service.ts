import { db } from "@/db";
import { pagesTable, suggestionsTable, reportsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deletePageService(pageId: string) {
  // First delete all suggestions related to the page
  await db.delete(suggestionsTable)
    .where(eq(suggestionsTable.pageId, pageId));

  // Then delete all reports related to the page
  await db.delete(reportsTable)
    .where(eq(reportsTable.pageId, pageId));

  // Finally delete the page itself
  await db.delete(pagesTable)
    .where(eq(pagesTable.id, pageId));
} 