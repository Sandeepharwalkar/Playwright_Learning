const { test, expect } = require('@playwright/test');

test('Contact Us Form Automation', async ({ page }) => {

  // Navigate to the page containing your contact form
  await page.goto('https://www.bebeautiful.in/contact-us');

  // Full name
  await page.fill('input[name="name"]', 'John Doe');

  // Email
  await page.fill('input[name="email"]', 'john.doe@example.com');

  // Phone number
  await page.fill('input[name="phone"]', '9876543210');

  // Select concern
  await page.selectOption('select[name="concern"]', 'productquality');
  // Options available:
  // productquality | orderissue | returnandexchange | makeup | skin | hair

  // Message
  await page.fill('input[name="message"]', 'I have a concern regarding your product quality.');

  // Checkbox: marketing consent
  const checkbox = page.locator('#customCheckbox');
  if (!(await checkbox.isChecked())) {
    await checkbox.check();
  }

  // Submit button
  await page.click('button[type="submit"]');

  // Optional: validate some success message if present
  // await expect(page.locator('.success-message')).toBeVisible();

});
