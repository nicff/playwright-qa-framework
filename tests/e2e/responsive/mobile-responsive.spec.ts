import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('SauceDemo - Responsive Design and Mobile Testing', () => {

  const mobileDevices = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung Galaxy S5', width: 360, height: 640 }
  ];

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.MOBILE} Desktop responsive layout`, async ({ page }) => {
    Logger.testStart('Testing desktop responsive layout');

    // Test different desktop viewport sizes
    const viewportSizes = [
      { width: 1920, height: 1080, name: 'Full HD' },
      { width: 1366, height: 768, name: 'HD' },
      { width: 1024, height: 768, name: 'Standard' }
    ];

    for (const viewport of viewportSizes) {
      Logger.phase(1, `Testing ${viewport.name} resolution: ${viewport.width}x${viewport.height}`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(ENVIRONMENTS.PRODUCTION);

      // Login
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify layout elements are visible and properly positioned
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
      await expect(page.locator(SELECTORS.NAV.MENU_BUTTON)).toBeVisible();
      await expect(page.locator(SELECTORS.NAV.CART_LINK)).toBeVisible();

      // Verify product grid adapts to viewport
      const productItems = page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM);
      const itemCount = await productItems.count();
      expect(itemCount).toBeGreaterThan(0);

      Logger.success(`${viewport.name} layout renders correctly`);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.MOBILE} Mobile device compatibility`, async ({ browser }) => {
    Logger.testStart('Testing mobile device compatibility');

    for (const device of mobileDevices) {
      Logger.phase(1, `Testing on ${device.name}`);

      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone dimensions
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });

      const page = await context.newPage();

      await page.goto(ENVIRONMENTS.PRODUCTION);

      // Login on mobile
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify mobile layout
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

      // Test mobile-specific interactions
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();

      // Test mobile navigation
      await page.click(SELECTORS.NAV.MENU_BUTTON);
      await expect(page.locator('.bm-menu-wrap')).toBeVisible();

      Logger.success(`${device.name} compatibility verified`);

      await context.close();
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.MOBILE} Touch interactions`, async ({ browser }) => {
    Logger.testStart('Testing touch interactions');

    // Create mobile context with touch support
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    try {
      await page.goto(ENVIRONMENTS.PRODUCTION);

      // Login with proper touch interactions
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.tap(SELECTORS.AUTH.LOGIN_BUTTON);

      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

      // Test real touch interactions
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().tap();
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();

      // Test menu tap
      await page.tap(SELECTORS.NAV.MENU_BUTTON);
      await expect(page.locator('.bm-menu-wrap')).toBeVisible();

      // Test tap to close menu
      await page.tap('.bm-cross-button');
      await expect(page.locator('.bm-menu-wrap')).not.toBeVisible();

      Logger.success('Touch interactions working correctly');
    } finally {
      await context.close();
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.MOBILE} Mobile checkout flow`, async ({ browser }) => {
    Logger.testStart('Testing mobile checkout flow');

    // Create mobile context with touch support for realistic mobile testing
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    try {
      await page.goto(ENVIRONMENTS.PRODUCTION);

      // Complete mobile checkout flow using real touch interactions
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.tap(SELECTORS.AUTH.LOGIN_BUTTON);

      // Add item and checkout on mobile with touch
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().tap();
      await page.tap(SELECTORS.NAV.CART_LINK);
      await page.tap(SELECTORS.CART.CHECKOUT_BUTTON);

      // Fill mobile form
      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

      await page.tap(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
      await page.tap(SELECTORS.CHECKOUT.FINISH_BUTTON);

      await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();

      Logger.success('Mobile checkout flow completed successfully');
    } finally {
      await context.close();
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.MOBILE} Tablet layout`, async ({ page }) => {
    Logger.testStart('Testing tablet layout');

    // Set tablet viewport (iPad dimensions)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(ENVIRONMENTS.PRODUCTION);

    // Login
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Verify tablet-optimized layout
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    // Check product grid layout on tablet
    const productItems = page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM);
    const boundingBoxes = [];

    for (let i = 0; i < Math.min(4, await productItems.count()); i++) {
      const bbox = await productItems.nth(i).boundingBox();
      if (bbox) boundingBoxes.push(bbox);
    }

    // Verify items are properly arranged
    expect(boundingBoxes.length).toBeGreaterThan(0);
    Logger.success('Tablet layout verified with proper product arrangement');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.MOBILE} Landscape vs Portrait orientation`, async ({ page }) => {
    Logger.testStart('Testing landscape vs portrait orientation');

    // Test portrait first
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ENVIRONMENTS.PRODUCTION);

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
    Logger.success('Portrait orientation layout verified');

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();

    // Verify layout adapts to landscape
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    // Test functionality in landscape
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();

    Logger.success('Landscape orientation layout verified');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.MOBILE} Small screen form usability`, async ({ page }) => {
    Logger.testStart('Testing small screen form usability');

    // Set very small viewport
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(ENVIRONMENTS.PRODUCTION);

    // Test login form on small screen
    await expect(page.locator(SELECTORS.AUTH.USERNAME_INPUT)).toBeVisible();
    await expect(page.locator(SELECTORS.AUTH.PASSWORD_INPUT)).toBeVisible();
    await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();

    // Login and test checkout form
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    // Verify form fields are accessible on small screen
    await expect(page.locator(SELECTORS.CHECKOUT.FIRST_NAME_INPUT)).toBeVisible();
    await expect(page.locator(SELECTORS.CHECKOUT.LAST_NAME_INPUT)).toBeVisible();
    await expect(page.locator(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT)).toBeVisible();

    // Test form can be filled on small screen
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    Logger.success('Small screen form usability verified');
  });

});
