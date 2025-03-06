import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deletePage } from '../actions/delete-page.action';
import { db } from '@/db';
import { pagesTable, suggestionsTable, reportsTable } from '@/db/schema';
import { mockUser, mockAuthSession } from '@/utils/auth-mocks';
import { getUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('deletePage action (integration)', () => {
    const TEST_URL = 'https://test-delete.com';
  
    beforeEach(async () => {
      vi.clearAllMocks();
      // Clean up only our test data in correct order
      await db.delete(suggestionsTable)
        .where(
          eq(suggestionsTable.pageId, 
            db.select({ id: pagesTable.id })
              .from(pagesTable)
              .where(and(
                eq(pagesTable.userId, mockUser.id),
                eq(pagesTable.url, TEST_URL)
              ))
              .limit(1)
          )
        );
      
      await db.delete(reportsTable)
        .where(
          eq(reportsTable.pageId,
            db.select({ id: pagesTable.id })
              .from(pagesTable)
              .where(and(
                eq(pagesTable.userId, mockUser.id),
                eq(pagesTable.url, TEST_URL)
              ))
              .limit(1)
          )
        );
  
      await db.delete(pagesTable)
        .where(and(
          eq(pagesTable.userId, mockUser.id),
          eq(pagesTable.url, TEST_URL)
        ));
    });
  
    it('should successfully delete a page and its related data', async () => {
      vi.mocked(getUser).mockResolvedValue(mockAuthSession);
  
      // Insert test page
      const [testPage] = await db.insert(pagesTable).values({
        userId: mockUser.id,
        url: TEST_URL,
        keyword: 'test',
      }).returning();
  
      // Insert test report first
      const [testReport] = await db.insert(reportsTable).values({
        pageId: testPage.id,
        method: 'competitor-analysis',
      }).returning();
  
      // Insert related suggestions with required fields
      await db.insert(suggestionsTable).values({
        pageId: testPage.id,
        reportId: testReport.id,
        description: 'test suggestion description',
        reason: 'test suggestion reason',
        priorityLevel: 'medium',
      });
  
      // Delete the page
      const result = await deletePage(testPage.id);
  

    // Verify deletion
    expect(result).toEqual({ success: true });

    // Verify our test page is deleted
    const remainingPages = await db.select()
      .from(pagesTable)
      .where(and(
        eq(pagesTable.userId, mockUser.id),
        eq(pagesTable.url, TEST_URL)
      ));
    expect(remainingPages).toHaveLength(0);

    // Verify related test data is deleted
    const remainingSuggestions = await db.select()
      .from(suggestionsTable)
      .where(eq(suggestionsTable.pageId, testPage.id));
    expect(remainingSuggestions).toHaveLength(0);

    const remainingReports = await db.select()
      .from(reportsTable)
      .where(eq(reportsTable.pageId, testPage.id));
    expect(remainingReports).toHaveLength(0);
  });

  it('should throw error if user is not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue({ user: null, session: null });

    await expect(deletePage('some-id')).rejects.toThrow('Unauthorized');
  });


});