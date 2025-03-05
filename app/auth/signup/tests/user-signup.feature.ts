/*
Feature: User Sign Up
  As a new Mind Tune user
  I want to create an account
  So that I can access the Mind Tune system

  Scenario: Successful registration
    Given I am on the registration page
    When I enter a valid email, password and confirm password
    And I submit the registration form
    Then I should be redirected to the root page

  Scenario: Registration with existing email
    Given I am on the registration page
    When I enter an email that is already registered
    And I submit the registration form
    Then I should see an error message
    And I should remain on the registration page
*/

import { test, expect } from '@playwright/test';


const SIGNUP_URL = '/auth/signup';
const newUserEmail = `test${Date.now()}@example.com`;
const newUserPassword = `Password123`;

test('Successful registration', async ({ page }) => {

    await test.step('Given I am on the registration page', async () => {
        await page.goto(SIGNUP_URL);
    });

    await test.step('When I enter a valid email, password and confirm password', async () => {
        await page.fill('input[name="email"]', newUserEmail);
        await page.fill('input[name="password"]', newUserPassword);
        await page.fill('input[name="confirmPassword"]', newUserPassword);
    });

    await test.step('Then I submit the registration form', async () => {
        await page.click('button:has-text("Sign Up")');
    });

    await test.step('Then I should be redirected to the root page', async () => {
        await page.waitForURL('/home');
        await expect(page).toHaveURL('/home');
    });
});

test('Registration with existing email', async ({ page }) => {
    await test.step('Given I am on the registration page', async () => {
        await page.goto(SIGNUP_URL);
    });

    await test.step('When I enter an email that is already registered', async () => {
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'Password123');
        await page.fill('input[name="confirmPassword"]', 'Password123');
    });

    await test.step('And I submit the registration form', async () => {
        await page.click('button:has-text("Sign Up")');
    });

    await test.step('Then I should see an error message', async () => {
        await expect(page.getByText('Email already taken')).toBeVisible();
    });

    await test.step('And I should remain on the registration page', async () => {
        await page.waitForURL('/auth/signup');
        await expect(page).toHaveURL('/auth/signup');
    });
});

