import { test, expect } from '@playwright/test';
import {
  loginSauceDemo,
  Logger,
  cleanupTest
} from '@helpers/test-helpers';
import { SELECTORS, TEST_TAGS } from '@utils/constants';

test.describe('SauceDemo - Page Load Performance Tests', () => {

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Login page loads within acceptable time`, async ({ browser }) => {
    Logger.testStart('Login page load performance');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const startTime = Date.now();
      await page.goto('https://www.saucedemo.com');
      await page.waitForSelector(SELECTORS.AUTH.LOGIN_BUTTON, { timeout: 10000 });
      const loadTime = Date.now() - startTime;

      // Verify page loads within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      Logger.success(`Login page loaded in ${loadTime}ms`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Inventory page loads within acceptable time`, async ({ browser }) => {
    Logger.testStart('Inventory page load performance');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      const startTime = Date.now();
      await page.goto('https://www.saucedemo.com/inventory.html');
      await page.waitForSelector(SELECTORS.INVENTORY.PRODUCT_LIST, { timeout: 10000 });
      const loadTime = Date.now() - startTime;

      // Verify page loads within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      Logger.success(`Inventory page loaded in ${loadTime}ms`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product images load properly`, async ({ browser }) => {
    Logger.testStart('Product images load performance');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Wait for all images to load
      await page.waitForLoadState('networkidle');

      const productImages = page.locator(SELECTORS.INVENTORY.PRODUCT_IMAGE);
      const imageCount = await productImages.count();

      // Verify all images have loaded (have naturalWidth > 0)
      for (let i = 0; i < imageCount; i++) {
        const naturalWidth = await productImages.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }

      Logger.success(`All ${imageCount} product images loaded successfully`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cart page navigation performance`, async ({ browser }) => {
    Logger.testStart('Cart page navigation performance');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Add item to cart first
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

      const startTime = Date.now();
      await page.click(SELECTORS.NAV.CART_LINK);
      await page.waitForSelector(SELECTORS.CART.CART_LIST, { timeout: 5000 });
      const navigationTime = Date.now() - startTime;

      // Verify navigation is fast (under 2 seconds)
      expect(navigationTime).toBeLessThan(2000);

      Logger.success(`Cart navigation completed in ${navigationTime}ms`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Performance comparison across user types`, async ({ browser }) => {
    Logger.testStart('Performance comparison across user types');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const users = ['STANDARD_USER', 'PROBLEM_USER', 'PERFORMANCE_GLITCH_USER'] as const;
      const performanceResults = [];

      for (const userType of users) {
        Logger.phase(1, `Testing performance for ${userType}`);

        await page.goto('https://www.saucedemo.com');

        const startTime = Date.now();
        await loginSauceDemo(page, userType);
        const loginTime = Date.now() - startTime;

        performanceResults.push({
          user: userType,
          loginTime: loginTime
        });

        await page.click(SELECTORS.NAV.MENU_BUTTON);
        await page.click(SELECTORS.NAV.LOGOUT_LINK);
      }

      // Log performance comparison
      performanceResults.forEach(result => {
        Logger.success(`${result.user}: ${result.loginTime}ms`);
      });

      // Performance glitch user should be slower
      const perfGlitchResult = performanceResults.find(r => r.user === 'PERFORMANCE_GLITCH_USER');
      const standardResult = performanceResults.find(r => r.user === 'STANDARD_USER');

      if (perfGlitchResult && standardResult) {
        expect(perfGlitchResult.loginTime).toBeGreaterThan(standardResult.loginTime);
      }

      Logger.success('Performance comparison completed');
    } finally {
      await cleanupTest(context, page);
    }
  });

});