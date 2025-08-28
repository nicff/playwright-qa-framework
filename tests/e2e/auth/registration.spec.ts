import { test, expect } from '@playwright/test';
import { 
  loginSauceDemo,
  logoutSauceDemo,
  Logger,
  cleanupTest
} from '@helpers/test-helpers';
import { SELECTORS, TEST_TAGS, TEST_DATA } from '@utils/constants';

test.describe('test - user account security validation', () => {

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} All SauceDemo test users are accessible`, async ({ browser }) => {
    Logger.testStart('SauceDemo test users accessibility verification');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      const testUsers = [
        'STANDARD_USER',
        'PROBLEM_USER',
        'PERFORMANCE_GLITCH_USER',
        'ERROR_USER',
        'VISUAL_USER'
      ] as const;

      for (const userType of testUsers) {
        Logger.phase(1, `Testing access for: ${TEST_DATA.SAUCEDEMO_USERS[userType].username}`);

        await loginSauceDemo(page, userType);
        await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
        await logoutSauceDemo(page);
      }

      Logger.success('All test users are accessible');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.CRITICAL} ${TEST_TAGS.AUTH} Locked out user remains blocked`, async ({ browser }) => {
    Logger.testStart('Locked out user security verification');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('https://www.saucedemo.com');

      const lockedUser = TEST_DATA.SAUCEDEMO_USERS.LOCKED_OUT_USER;
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, lockedUser.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, lockedUser.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify locked out error persists
      const errorMessage = page.locator(SELECTORS.AUTH.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('locked out');

      // Verify cannot access inventory even with direct URL
      await page.goto('https://www.saucedemo.com/inventory.html');
      await expect(page).toHaveURL('https://www.saucedemo.com/');

      Logger.success('Locked out user properly secured');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Session isolation between users`, async ({ browser }) => {
    Logger.testStart('Session isolation verification');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Login as standard user and add items to cart
      await loginSauceDemo(page, 'STANDARD_USER');
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

      // Logout and login as different user
      await logoutSauceDemo(page);
      await loginSauceDemo(page, 'PROBLEM_USER');

      // Verify cart is empty for new user (sessions are isolated)
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).not.toBeVisible();

      Logger.success('Session isolation working correctly');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} User credentials are case sensitive`, async ({ browser }) => {
    Logger.testStart('Case sensitivity verification');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('https://www.saucedemo.com');

      // Test with modified case
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, 'Standard_User'); // Wrong case
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();

      Logger.success('Credentials are properly case sensitive');
    } finally {
      await cleanupTest(context, page);
    }
  });

});