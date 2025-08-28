import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('sauceDemo - URL navigation and direct access', () => {

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Protected URLs redirect to login when not authenticated`, async ({ page }) => {
    Logger.testStart('Testing protected URL redirects');

    const protectedUrls = [
      `${ENVIRONMENTS.PRODUCTION}/inventory.html`,
      `${ENVIRONMENTS.PRODUCTION}/cart.html`,
      `${ENVIRONMENTS.PRODUCTION}/checkout-step-one.html`,
      `${ENVIRONMENTS.PRODUCTION}/checkout-step-two.html`,
      `${ENVIRONMENTS.PRODUCTION}/checkout-complete.html`
    ];

    for (const url of protectedUrls) {
      Logger.phase(1, `Testing protected URL: ${url}`);

      await page.goto(url);

      // Should be redirected to login page
      await expect(page).toHaveURL(ENVIRONMENTS.PRODUCTION);
      await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();

      Logger.success(`Protected URL correctly redirects to login: ${url}`);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Authenticated URLs are accessible after login`, async ({ page }) => {
    Logger.testStart('Testing authenticated URL access');

    // Login first
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    const authenticatedUrls = [
      { url: `${ENVIRONMENTS.PRODUCTION}/inventory.html`, element: SELECTORS.INVENTORY.PRODUCT_LIST },
      { url: `${ENVIRONMENTS.PRODUCTION}/cart.html`, element: SELECTORS.CART.CART_LIST }
    ];

    for (const urlTest of authenticatedUrls) {
      Logger.phase(1, `Testing authenticated URL: ${urlTest.url}`);

      await page.goto(urlTest.url);
      await expect(page.locator(urlTest.element)).toBeVisible();

      Logger.success(`Authenticated URL access working: ${urlTest.url}`);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Cart URL maintains state`, async ({ page }) => {
    Logger.testStart('Testing cart URL state maintenance');

    // Login and add items to cart
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(1).click();

    // Navigate directly to cart URL
    await page.goto(`${ENVIRONMENTS.PRODUCTION}/cart.html`);

    // Verify cart items are displayed
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(2);
    Logger.success('Cart URL maintains state correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} URL navigation with browser back/forward`, async ({ page }) => {
    Logger.testStart('Testing browser back/forward navigation');

    // Login
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Navigate to cart
    await page.click(SELECTORS.NAV.CART_LINK);
    await expect(page).toHaveURL(/.*cart.html/);

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(page.locator(SELECTORS.CART.CART_LIST)).toBeVisible();

    Logger.success('Browser back/forward navigation working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Deep linking to specific pages`, async ({ page }) => {
    Logger.testStart('Testing deep linking functionality');

    // Login
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Test deep linking to inventory-item page (if it exists)
    const currentUrl = page.url();
    const baseUrl = currentUrl.replace('/inventory.html', '');

    // Navigate directly to a specific inventory item (this tests SauceDemo's routing)
    const itemUrl = `${baseUrl}/inventory-item.html?id=4`;
    await page.goto(itemUrl);

    // SauceDemo might redirect or show the item - verify the page loads
    await page.waitForLoadState('networkidle');
    const finalUrl = page.url();
    Logger.success(`Deep link navigation: ${itemUrl} -> ${finalUrl}`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Invalid URL handling`, async ({ page }) => {
    Logger.testStart('Testing invalid URL handling');

    const invalidUrls = [
      `${ENVIRONMENTS.PRODUCTION}/invalid-page.html`,
      `${ENVIRONMENTS.PRODUCTION}/nonexistent.html`,
      `${ENVIRONMENTS.PRODUCTION}/test/404.html`
    ];

    for (const url of invalidUrls) {
      Logger.phase(1, `Testing invalid URL: ${url}`);

      await page.goto(url);

      // Document the actual behavior
      const currentUrl = page.url();
      const pageContent = await page.content();

      // SauceDemo might redirect to login or show a 404 - document the behavior
      if (currentUrl.includes('inventory.html')) {
        Logger.success(`Invalid URL redirected to inventory: ${url}`);
      } else if (currentUrl === ENVIRONMENTS.PRODUCTION) {
        Logger.success(`Invalid URL redirected to login: ${url}`);
      } else {
        Logger.success(`Invalid URL behavior documented: ${url} -> ${currentUrl}`);
      }
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} URL parameters handling`, async ({ page }) => {
    Logger.testStart('Testing URL parameters handling');

    // Login
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Test URLs with parameters
    const urlsWithParams = [
      `${ENVIRONMENTS.PRODUCTION}/inventory.html?sort=za`,
      `${ENVIRONMENTS.PRODUCTION}/inventory.html?filter=price`,
      `${ENVIRONMENTS.PRODUCTION}/cart.html?source=inventory`
    ];

    for (const url of urlsWithParams) {
      Logger.phase(1, `Testing URL with parameters: ${url}`);

      await page.goto(url);

      // Verify the page loads correctly despite parameters
      if (url.includes('inventory.html')) {
        await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
      } else if (url.includes('cart.html')) {
        await expect(page.locator(SELECTORS.CART.CART_LIST)).toBeVisible();
      }

      Logger.success(`URL with parameters handled correctly: ${url}`);
    }
  });

});
