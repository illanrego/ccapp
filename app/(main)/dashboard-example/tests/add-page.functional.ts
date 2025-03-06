/**
 * Given I am on the Dashboard page
 * When I click the Add New Page button
 * And I fill in the page details
 * Then the new page should be added to the dashboard
 */

import { test, expect } from "@playwright/test";
import { email, password } from '../../../feature.fixtures'; // You'll need to create this

const testUrl = 'https://example.com';
const testKeyword = 'test keyword';

test("Add Page", async ({ page }) => {
   await test.step("Given I'm logged in", async () => {
      await page.goto("/auth/signin");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL("/dashboard");
   });

   await test.step("When I click the Add New Page button", async () => {
      const addButton = page.getByRole('button', { name: 'Add New Page' });
      await expect(addButton).toBeVisible();
      await addButton.click();
      
      // Verify dialog is shown
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
   });

   await test.step("And I fill in the page details", async () => {
      // Fill URL
      const urlInput = page.getByLabel('URL');
      await expect(urlInput).toBeVisible();
      await urlInput.fill(testUrl);
      await expect(urlInput).toHaveValue(testUrl);

      // Fill keyword
      const keywordInput = page.getByLabel('Target Keyword');
      await expect(keywordInput).toBeVisible();
      await keywordInput.fill(testKeyword);
      await expect(keywordInput).toHaveValue(testKeyword);

      // Submit form
      const submitButton = page.getByRole('button', { name: 'Add Page' });
      await submitButton.click();
   });

   await test.step("Then the dialog should close", async () => {
      // Dialog should be closed
      const dialog = page.getByRole('dialog');
      await expect(dialog).not.toBeVisible();

   });

   await test.step("And the new page should be visible in the dashboard", async () => {
    // Wait for any loading states or refreshes to complete
    await page.waitForTimeout(1000); // Give time for the UI to update
 
    // Get the count of URLs before checking for the new one
    const urlElements = page.getByRole('link', { name: testUrl });
    const count = await urlElements.count();
    
    // Check the most recently added URL (should be the last one)
    const lastUrl = urlElements.nth(count - 1);
    await expect(lastUrl).toBeVisible();
    
    // For the keyword, we can look for it near the URL we just found
    const row = lastUrl.locator('..').locator('..');  // Go up to the row level
    await expect(row.getByText(testKeyword)).toBeVisible();
 });
});