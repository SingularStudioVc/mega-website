import { test, expect } from '@playwright/test';

// Assumes dev server is running on http://localhost:5174
const BASE_URL = 'http://localhost:5174';

test('Clicking MEGA logo shows the megaverse overlay', async ({ page }) => {
  await page.goto(BASE_URL);

  // The MEGA logo is inside #mega-heading
  const megaHeading = page.locator('#mega-heading');
  await expect(megaHeading).toBeVisible();

  // Click the MEGA logo
  await megaHeading.click();

  // The megaverse overlay should appear
  const overlay = page.locator('#mega-3d-overlay');
  await expect(overlay).toBeVisible();

  // Optionally, close the overlay and check it disappears
  await overlay.click();
  await expect(overlay).not.toBeVisible();
}); 