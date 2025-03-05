/**
Feature: User Login
  As a registered Mind Tune user
  I want to log in to my account
  So that I can access my personalized content

  Scenario: Successful login
    Given I am on the login page
    When I enter my registered email and correct password
    And I submit the login form
    Then I should be authenticated
    And I should be redirected to the dashboard

  Scenario: Failed login
    Given I am on the login page
    When I enter incorrect credentials
    And I submit the login form
    Then I should see an error message
    And I should remain on the login page
*/

import { test, expect } from '@playwright/test';
import * as fixtures from '@/app/feature.fixtures';
const SIGNIN_URL = '/auth/signin';

test('Successful login', async ({ page }) => {
    await test.step('Given I am on the login page', async () => {
        await page.goto(SIGNIN_URL);
    });
    await test.step('When I enter my registered email and correct password', async () => {
        await page.fill('input[name="email"]', fixtures.email);
        await page.fill('input[name="password"]', fixtures.password);
    });
    await test.step('And I submit the login form', async () => {
        await page.click('button[type="submit"]');
    });
    await test.step('Then I should be authenticated', async () => {
        await page.waitForURL('/home');
        await expect(page).toHaveURL('/home');
    });
});


test('Failed login', async ({ page }) => {
    await test.step('Given I am on the login page', async () => {
        await page.goto(SIGNIN_URL);
    });
    await test.step('When I enter incorrect credentials', async () => {
        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
    });
    await test.step('And I submit the login form', async () => {
        await page.click('button[type="submit"]');
    });
    await test.step('Then I should see an error message', async () => {
        await expect(page.getByText('Incorrect email or password')).toBeVisible();
    });
    await test.step('And I should remain on the login page', async () => {
        await expect(page).toHaveURL(SIGNIN_URL);
    });
});



