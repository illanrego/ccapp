/**
 * Given I am logged in
 * When I visit the dashboard
 * Then I should see my pages listed
 */

import { test, expect } from "@playwright/test";
import { email, password } from '@/app/feature.fixtures';

test("View Dashboard", async ({ page }) => {
  await test.step("Given I'm logged in", async () => {
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  await test.step("When I am on the dashboard", async () => {
    // Verify dashboard header
    await page.waitForSelector('h1:has-text("Dashboard")');
    await expect(page.getByText('Monitor and manage your tracked pages')).toBeVisible();
  });

  await test.step("Then I should see the pages table", async () => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Get table and verify it exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Verify basic table structure
    await expect(page.getByText('URL')).toBeVisible();
    await expect(page.getByText('Target Keyword')).toBeVisible();
    await expect(page.getByText('Date Added')).toBeVisible();
    await expect(page.getByText('Last Analysis')).toBeVisible();
  });
});