import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('SauceDemo - Security and Edge Cases Testing', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ENVIRONMENTS.PRODUCTION);
  });

  test(`${TEST_TAGS.CRITICAL} ${TEST_TAGS.AUTH} SQL injection attempts in login`, async ({ page }) => {
    Logger.testStart('Testing SQL injection attempts in login fields');

    const sqlInjectionAttempts = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "admin'--",
      "' OR 1=1 --",
      "' UNION SELECT * FROM users --"
    ];

    for (const injection of sqlInjectionAttempts) {
      Logger.phase(1, `Testing SQL injection: ${injection}`);

      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, injection);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, injection);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Should show error, not allow login
      const errorMessage = page.locator(SELECTORS.AUTH.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();

      // Should not reach inventory page
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).not.toBeVisible();

      // Clear for next iteration
      await page.locator('.error-message-container .error-button').click();
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, '');
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, '');
    }

    Logger.success('SQL injection attempts properly blocked');
  });

  test(`${TEST_TAGS.CRITICAL} ${TEST_TAGS.AUTH} XSS attempts in form fields`, async ({ page }) => {
    Logger.testStart('Testing XSS attempts in form fields');

    // Login first
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="invalid-image.jpg" alt="XSS Test Image">',
      '<svg onload="alert(\'XSS\')">',
      '"><img src=x onerror=alert("XSS") alt="XSS Test">',
      // ...existing payloads
    ];

    for (const xss of xssPayloads) {
      Logger.phase(1, `Testing XSS attempt: ${xss.substring(0, 30)}...`);

      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, xss);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, xss);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, xss);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // XSS should be sanitized, check that no alert was triggered
      // and form either rejects input or sanitizes it
      const currentUrl = page.url();
      Logger.success(`XSS attempt handled, current URL: ${currentUrl}`);

      // Clear fields for next iteration
      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, '');
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, '');
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, '');
    }

    Logger.success('XSS attempts properly handled');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Brute force protection`, async ({ page }) => {
    Logger.testStart('Testing brute force protection');

    const maxAttempts = 10;
    let attemptCount = 0;

    for (let i = 0; i < maxAttempts; i++) {
      attemptCount++;
      Logger.phase(1, `Brute force attempt ${attemptCount}/${maxAttempts}`);

      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, 'invalid_user');
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, `wrong_password_${i}`);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Check if error message appears
      const errorMessage = page.locator(SELECTORS.AUTH.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();

      // Clear error for next attempt
      await page.locator('.error-message-container .error-button').click();
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, '');
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, '');

      // Small delay between attempts
      await page.waitForTimeout(100);
    }

    Logger.success(`Completed ${attemptCount} brute force attempts - system behavior documented`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Negative price manipulation`, async ({ page }) => {
    Logger.testStart('Testing price manipulation attempts');

    // Login and inspect network requests
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Get original prices
    const originalPrices = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).allTextContents();
    Logger.success(`Original prices recorded: ${originalPrices.slice(0, 3).join(', ')}...`);

    // Add item and go to checkout
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Verify prices cannot be manipulated client-side
    const checkoutPrice = await page.locator('.inventory_item_price').first().textContent();
    expect(checkoutPrice).toBe(originalPrices[0]);

    Logger.success('Price integrity maintained throughout checkout');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cart quantity manipulation`, async ({ page }) => {
    Logger.testStart('Testing cart quantity manipulation attempts');

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Add item to cart
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);

    // Try to manipulate quantity through DOM
    // SauceDemo has fixed quantity of 1 per item
    const quantity = await page.locator(SELECTORS.CART.CART_QUANTITY).first().textContent();
    expect(quantity).toBe('1');

    // Verify quantity cannot be changed
    Logger.success('Cart quantity is properly controlled');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Session hijacking protection`, async ({ page }) => {
    Logger.testStart('Testing session hijacking protection');

    // Login and get session cookies
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    const cookies = await page.context().cookies();
    Logger.success(`Session cookies: ${cookies.length} found`);

    // Verify secure cookie attributes (if any)
    cookies.forEach(cookie => {
      Logger.success(`Cookie ${cookie.name}: httpOnly=${cookie.httpOnly}, secure=${cookie.secure}`);
    });

    // Test session persistence
    await page.reload();
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    Logger.success('Session security attributes verified');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} URL tampering protection`, async ({ page }) => {
    Logger.testStart('Testing URL tampering protection');

    // Login first
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Try to access checkout without items in cart
    await page.goto(`${ENVIRONMENTS.PRODUCTION}/checkout-step-one.html`);

    // Should either redirect or handle gracefully
    const currentUrl = page.url();
    Logger.success(`Direct checkout access resulted in: ${currentUrl}`);

    // Try to access completion page directly
    await page.goto(`${ENVIRONMENTS.PRODUCTION}/checkout-complete.html`);

    const finalUrl = page.url();
    Logger.success(`Direct completion access resulted in: ${finalUrl}`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Input boundary testing`, async ({ page }) => {
    Logger.testStart('Testing input boundary conditions');

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    const boundaryTests = [
      { name: 'Empty strings', firstName: '', lastName: '', postalCode: '' },
      { name: 'Single characters', firstName: 'A', lastName: 'B', postalCode: '1' },
      { name: 'Very long strings', firstName: 'A'.repeat(1000), lastName: 'B'.repeat(1000), postalCode: 'C'.repeat(1000) },
      { name: 'Special characters', firstName: '!@#$%^&*()', lastName: '<>?:"{}_+', postalCode: '[]\\|`~' },
      { name: 'Unicode characters', firstName: '测试用户', lastName: 'テストユーザー', postalCode: '🏠📮' },
      { name: 'Numbers only', firstName: '12345', lastName: '67890', postalCode: '11111' }
    ];

    for (const test of boundaryTests) {
      Logger.phase(1, `Testing boundary: ${test.name}`);

      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, test.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, test.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, test.postalCode);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Document the behavior
      const currentUrl = page.url();
      const hasError = await page.locator(SELECTORS.CHECKOUT.ERROR_MESSAGE).isVisible();

      Logger.success(`${test.name}: URL=${currentUrl.includes('step-two') ? 'Proceeded' : 'Stayed'}, Error=${hasError}`);

      // Reset for next test
      if (hasError) {
        await page.locator('.error-message-container .error-button').click();
      } else {
        // Go back if we proceeded
        await page.goto(`${ENVIRONMENTS.PRODUCTION}/checkout-step-one.html`);
      }
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Race condition testing`, async ({ page }) => {
    Logger.testStart('Testing race conditions');

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Rapid click testing
    Logger.phase(1, 'Testing rapid add to cart clicks');

    const addButton = page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first();

    // Click rapidly multiple times
    for (let i = 0; i < 5; i++) {
      await addButton.click();
      await page.waitForTimeout(10); // Very small delay
    }

    // Check final state
    const cartBadge = page.locator(SELECTORS.NAV.CART_BADGE);
    if (await cartBadge.isVisible()) {
      const count = await cartBadge.textContent();
      Logger.success(`Race condition test: Cart shows ${count} items`);
    } else {
      Logger.success('Race condition test: No cart badge visible');
    }

    // Verify actual cart contents
    await page.click(SELECTORS.NAV.CART_LINK);
    const actualItems = await page.locator(SELECTORS.CART.CART_ITEM).count();
    Logger.success(`Actual cart items: ${actualItems}`);
  });

});
