import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('SauceDemo - Performance and Load Testing', () => {

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Page load performance metrics`, async ({ page }) => {
    Logger.testStart('Testing page load performance metrics');

    // Enable performance monitoring
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    const startTime = Date.now();
    await page.goto(ENVIRONMENTS.PRODUCTION);
    const loadTime = Date.now() - startTime;

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });

    const entries = JSON.parse(performanceEntries);
    if (entries.length > 0) {
      const entry = entries[0];
      Logger.success(`Load performance: ${loadTime}ms total, DOM: ${entry.domContentLoadedEventEnd - entry.navigationStart}ms`);
    }

    // Stop coverage and analyze
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    Logger.success(`JS files: ${jsCoverage.length}, CSS files: ${cssCoverage.length}`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} Login performance comparison`, async ({ page }) => {
    Logger.testStart('Testing login performance across different users');

    const users = Object.values(TEST_DATA.SAUCEDEMO_USERS);
    const performanceResults = [];

    for (const user of users) {
      if (user.username === 'locked_out_user') continue;

      Logger.phase(1, `Testing login performance for: ${user.username}`);

      await page.goto(ENVIRONMENTS.PRODUCTION);

      const startTime = Date.now();
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, user.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, user.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 15000 });
      const loginTime = Date.now() - startTime;

      performanceResults.push({
        user: user.username,
        loginTime: loginTime
      });

      // Logout for next iteration
      await page.click(SELECTORS.NAV.MENU_BUTTON);
      await page.click(SELECTORS.NAV.LOGOUT_LINK);
      await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();
    }

    // Analyze results
    performanceResults.forEach(result => {
      Logger.success(`${result.user}: ${result.loginTime}ms`);
    });

    const avgTime = performanceResults.reduce((sum, r) => sum + r.loginTime, 0) / performanceResults.length;
    Logger.success(`Average login time: ${avgTime.toFixed(2)}ms`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cart operation performance`, async ({ page }) => {
    Logger.testStart('Testing cart operation performance');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Test adding all items to cart
    const productCount = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();
    const addTimes = [];

    for (let i = 0; i < productCount; i++) {
      const startTime = Date.now();
      // Always click the first available "Add to Cart" button instead of using index
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

      // Wait for cart badge to update
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText((i + 1).toString());
      const addTime = Date.now() - startTime;
      addTimes.push(addTime);

      Logger.success(`Add item ${i + 1}: ${addTime}ms`);
    }

    const avgAddTime = addTimes.reduce((sum, time) => sum + time, 0) / addTimes.length;
    Logger.success(`Average add to cart time: ${avgAddTime.toFixed(2)}ms`);

    // Test cart page load with all items
    const cartStartTime = Date.now();
    await page.click(SELECTORS.NAV.CART_LINK);
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(productCount);
    const cartLoadTime = Date.now() - cartStartTime;

    Logger.success(`Cart page load with ${productCount} items: ${cartLoadTime}ms`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Checkout process performance`, async ({ page }) => {
    Logger.testStart('Testing checkout process performance');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Add item and proceed to checkout
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);

    // Measure checkout step transitions
    const checkoutStartTime = Date.now();
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    const step1Time = Date.now() - checkoutStartTime;

    const formStartTime = Date.now();
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    const step2Time = Date.now() - formStartTime;

    const finishStartTime = Date.now();
    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    const finishTime = Date.now() - finishStartTime;

    Logger.success(`Checkout performance - Step 1: ${step1Time}ms, Step 2: ${step2Time}ms, Finish: ${finishTime}ms`);
    Logger.success(`Total checkout time: ${step1Time + step2Time + finishTime}ms`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sorting performance`, async ({ page }) => {
    Logger.testStart('Testing product sorting performance');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    const sortOptions = ['za', 'lohi', 'hilo', 'az'];
    const sortTimes = [];

    for (const option of sortOptions) {
      const startTime = Date.now();
      await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, option);

      // Wait for sorting to complete
      await page.waitForTimeout(500);
      const sortTime = Date.now() - startTime;
      sortTimes.push({ option, time: sortTime });

      Logger.success(`Sort by ${option}: ${sortTime}ms`);
    }

    const avgSortTime = sortTimes.reduce((sum, sort) => sum + sort.time, 0) / sortTimes.length;
    Logger.success(`Average sort time: ${avgSortTime.toFixed(2)}ms`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Memory usage monitoring`, async ({ page }) => {
    Logger.testStart('Testing memory usage during extended session');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Perform multiple operations to monitor memory
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      // Add items to cart
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

      // Navigate to cart
      await page.click(SELECTORS.NAV.CART_LINK);

      // Remove items
      await page.locator(SELECTORS.CART.REMOVE_BUTTON).first().click();

      // Go back to inventory
      await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);

      // Sort products
      await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'lohi');
      await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'az');

      if (i % 3 === 0) {
        const memoryInfo = await page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          } : null;
        });

        if (memoryInfo) {
          Logger.success(`Iteration ${i}: Memory used: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    }

    Logger.success(`Completed ${iterations} iterations of cart operations`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Network requests monitoring`, async ({ page }) => {
    Logger.testStart('Testing network requests monitoring');

    const requestsData: Array<{ method: string; url: string; status?: number }> = [];
    const responsesData: Array<{ status: number; url: string }> = [];

    // Monitor network activity
    page.on('request', request => {
      requestsData.push({
        method: request.method(),
        url: request.url()
      });
    });

    page.on('response', response => {
      responsesData.push({
        status: response.status(),
        url: response.url()
      });
    });

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Perform typical user journey
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Analyze network activity
    const totalRequests = requestsData.length;
    const successfulResponses = responsesData.filter(r => r.status >= 200 && r.status < 400).length;
    const failedResponses = responsesData.filter(r => r.status >= 400).length;

    Logger.success(`Network Analysis:
      Total requests: ${totalRequests}
      Successful responses: ${successfulResponses}
      Failed responses: ${failedResponses}`);

    // Log first 5 requests for debugging
    requestsData.slice(0, 5).forEach((req, index) => {
      Logger.success(`Request ${index + 1}: ${req.method} ${req.url}`);
    });
  });

});
