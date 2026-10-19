import { test, expect } from '@playwright/test';
test('infraroom loads and adds resource', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('InfraRoom: demo');
  await page.locator('.name-input').fill('web-server');
  await page.locator('.type-input').selectOption('vm');
  await page.locator('.desired-input').fill('v1.0');
  await page.locator('.actual-input').fill('v1.0');
  await page.locator('.add-btn').click();
  await expect(page.locator('.resource-list').locator('div').first()).toBeVisible();
});