import { describe, it, expect, vi, afterAll } from 'vitest';
import { addPage } from '../actions/add-page.action';
import { db } from '@/db';
import { pagesTable, suggestionsTable, reportsTable } from '@/db/schema';
import { mockAuthSession } from '@/utils/auth-mocks';
import { eq } from 'drizzle-orm';

describe('addPage', () => {
  // Store the created page ID for cleanup
  let createdPageId: string;

  // Mock the auth using the shared mock
  vi.mock('@/lib/auth', () => ({
    getUser: async () => mockAuthSession
  }));

  it('should successfully add a new page', async () => {
    const input = {
      url: 'https://example.com/apache-guide',
      keyword: 'apache server setup'
    };

    const result = await addPage(input);
    createdPageId = result.id;

    expect(result).toBeDefined();
    expect(result.url).toBe(input.url);
    expect(result.keyword).toBe(input.keyword);
    expect(result.userId).toBe(mockAuthSession.user.id);
  });

  it('should throw error for invalid URL', async () => {
    const input = {
      url: 'not-a-valid-url',
      keyword: 'test keyword'
    };

    await expect(addPage(input)).rejects.toThrow('Please enter a valid URL');
  });

  it('should throw error for empty keyword', async () => {
    const input = {
      url: 'https://example.com',
      keyword: ''
    };

    await expect(addPage(input)).rejects.toThrow('Keyword is required');
  });

  // Cleanup after all tests
  afterAll(async () => {
    if (createdPageId) {
      try {
        // Delete related records first (following foreign key relationships)
        await db.delete(suggestionsTable)
          .where(eq(suggestionsTable.pageId, createdPageId));
        
        await db.delete(reportsTable)
          .where(eq(reportsTable.pageId, createdPageId));
        
        // Finally delete the page
        await db.delete(pagesTable)
          .where(eq(pagesTable.id, createdPageId));
      } catch (error) {
        console.error('Cleanup failed:', error);
        throw error;
      }
    }
  });
});