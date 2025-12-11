
// import { test, expect } from '@playwright/test';

// test('Open BeBeautiful website and search', async ({ page }) => {
//   await page.goto('https://www.bebeautiful.in/');
//    await page.waitForTimeout(3000);

//   // Wait for the search button and click
//   await page.locator('//button[@class="search-btn"]').click();

//   // Search input box
//   await page.locator('//*[@id="search"]').fill("dove");

//   // Press Enter
//   await page.keyboard.press('Enter');

//   await page.locator('//div[@class="productDetails"]/span[@class="shopNowButton"]').first().click();


//     await page.waitForTimeout(4000); 
//   await page.locator('button.buttonWithBorder.primaryButton').first().click();

//     await page.waitForTimeout(4000); 


//     await page.locator('button.cart-btn').first().click();

//     await page.waitForTimeout(4000); 

  

//     await page.locator('button.checkout-btn').click();

//     await page.waitForTimeout(4000); 
//     // await page.locator('//*[@id="firstName"]').fill("anil");




//   // Optional: wait for results
//     await page.waitForLoadState('networkidle');
// });

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('BeBeautiful full checkout flow with robust form fill + timeouts + diagnostics', async ({ page }, testInfo) => {
  // Helper: wait until locator is visible then fill
  test.setTimeout(180000); // 3 minutes

  async function fillWhenVisible(selector, value, timeout = 8000) {
    const loc = page.locator(selector);
    await loc.waitFor({ state: 'visible', timeout });
    await loc.fill(value);
  }

  // Helper: take diagnostics (screenshot + html)
  async function takeDiagnostics(tag = 'failure') {
    const dir = path.join('test-results', `${testInfo.title.replace(/\s+/g, '_')}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const screenshotPath = path.join(dir, `${tag}.png`);
    const htmlPath = path.join(dir, `${tag}.html`);
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      const html = await page.content();
      fs.writeFileSync(htmlPath, html, 'utf8');
      console.log(`Diagnostics saved: ${screenshotPath}, ${htmlPath}`);
    } catch (err) {
      console.warn('Failed to save diagnostics:', err);
    }
  }

  try {
    // 1️⃣ Open Website
    await page.goto('https://www.bebeautiful.in/');
    await page.waitForTimeout(3000);

    // 2️⃣ Search for "dove"
    await page.locator('//button[@class="search-btn"]').click();
    await page.waitForTimeout(2000);

    await page.locator('//*[@id="search"]').fill('dove');
    await page.waitForTimeout(1000);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // 3️⃣ Click first SHOP NOW
    await page.locator('//div[@class="productDetails"]/span[@class="shopNowButton"]').first().click();
    await page.waitForTimeout(4000);

    // 4️⃣ Add to Bag
    await page.locator('button.buttonWithBorder.primaryButton').first().click();
    await page.waitForTimeout(4000);

    // 5️⃣ Open Cart
    await page.locator('button.cart-btn').first().click();
    await page.waitForTimeout(4000);

    // 6️⃣ Checkout
    await page.locator('button.checkout-btn').click();
    await page.waitForTimeout(5000);

    // ensure navigation finished
    await page.waitForLoadState('networkidle');

    // 7️⃣ ---------- Fill Checkout Form ----------
    // Use the helper to wait for visibility before filling
    await fillWhenVisible('#firstName', 'Aretha', 10000);
    await page.waitForTimeout(1000);

    await fillWhenVisible('#lastName', 'Cooley', 10000);
    await page.waitForTimeout(2000);

    await fillWhenVisible('#phoneNumber', '9731445004', 10000);
    await page.waitForTimeout(1000);

    await fillWhenVisible('#email', 'jyqureni@mailinator.com', 10000);
    await page.waitForTimeout(1500);

    // Marketing consent checkbox (if present)
    const marketingCheckbox = page.locator('input[name="marketingConsent"]');
    if (await marketingCheckbox.count() > 0) {
      try {
        await marketingCheckbox.waitFor({ state: 'attached', timeout: 3000 });
        if (!(await marketingCheckbox.isChecked())) {
          await marketingCheckbox.check();
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // ignore if not present
      }
    }

    // Delivery details
    await fillWhenVisible('input[name="shippingAddress.address"]', 'Quia aut enim eligen', 8000);
    await page.waitForTimeout(500);

    await fillWhenVisible('input[name="shippingAddress.apartment"]', 'Et molestiae digniss', 8000);
    await page.waitForTimeout(500);

    await fillWhenVisible('input[name="shippingAddress.pinCode"]', '585310', 8000);
    await page.waitForTimeout(500);

    await fillWhenVisible('input[name="shippingAddress.city"]', 'Non dolores nulla au', 8000);
    await page.waitForTimeout(500);

    await fillWhenVisible('input[name="shippingAddress.state"]', 'Exercitationem qui r', 8000);
    await page.waitForTimeout(500);

    // Billing = Shipping checkbox (try to identify the correct one)
    await page.locator('label.billing-checkbox input[type="checkbox"]');
   
    await page.waitForTimeout(500);
    // 8️⃣ Click Payment button (desktop/mobile)
    await page.locator('button.buttonWithBorder.primaryButton').first().click();
    await page.waitForTimeout(5000);
  

  } catch (err) {
    console.error('Test failed — capturing diagnostics and rethrowing error:', err);
    await takeDiagnostics('on_error');
    throw err; // rethrow so Playwright registers the test as failed
  }
});
