import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listPages } from '../actions/list-pages.action';
import { getUser } from '@/lib/auth';
import { db } from '@/db';
import { pagesTable } from '@/db/schema';
import { mockUser, mockAuthSession } from '@/utils/auth-mocks';
import { eq, and, inArray } from 'drizzle-orm';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

describe('listPages action (integration)', () => {
  const TEST_URLS = [
    'https://test1.com',
    'https://test2.com',
    'https://old.com',
    'https://new.com'
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    // Only clean up specific test pages using drizzle-orm operators
    await db.delete(pagesTable)
      .where(and(eq(pagesTable.userId, mockUser.id), inArray(pagesTable.url, TEST_URLS)));
  });

  it('should list pages with correct sorting by URL', async () => {
    vi.mocked(getUser).mockResolvedValue(mockAuthSession);
    
    // Insert test data
    await db.insert(pagesTable).values([
      { userId: mockUser.id, url: TEST_URLS[0], keyword: 'test1', createdAt: new Date('2024-01-01') },
      { userId: mockUser.id, url: TEST_URLS[1], keyword: 'test2', createdAt: new Date('2024-01-02') }
    ]);

    const pages = await listPages('url', 'asc');

    // Find our test pages in the results
    const testPages = pages.filter(page => TEST_URLS.includes(page.url));
    expect(testPages).toHaveLength(2);
    expect(testPages[0].url).toBe(TEST_URLS[0]);
    expect(testPages[1].url).toBe(TEST_URLS[1]);
  });

  it('should list pages with correct sorting by date', async () => {
    vi.mocked(getUser).mockResolvedValue(mockAuthSession);
    
    // Insert test data with different dates
    await db.insert(pagesTable).values([
      { userId: mockUser.id, url: TEST_URLS[2], keyword: 'old', createdAt: new Date('2024-01-01') },
      { userId: mockUser.id, url: TEST_URLS[3], keyword: 'new', createdAt: new Date('2024-01-02') }
    ]);

    const pages = await listPages('createdAt', 'desc');

    // Find our test pages in the results
    const testPages = pages.filter(page => TEST_URLS.includes(page.url));
    expect(testPages).toHaveLength(2);
    expect(testPages[0].url).toBe(TEST_URLS[3]); // newer date should come first
    expect(testPages[1].url).toBe(TEST_URLS[2]);
  });

  it('should throw an error if user is not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue({ user: null, session: null });

    await expect(listPages()).rejects.toThrow('Unauthorized');
  });
});