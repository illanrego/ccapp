import { db } from "@/db";
import { pagesTable } from "@/db/schema";
import { AddPageInput } from "../actions/add-page.action";

export async function addPageService(userId: string, input: AddPageInput) {
  try {
    // Insert new page
    const [newPage] = await db.insert(pagesTable).values({
      userId,
      url: input.url,
      keyword: input.keyword,
    }).returning();

    return newPage;
  } catch (error) {
    console.error('Error adding page:', error);
    throw new Error('Failed to add page');
  }
}