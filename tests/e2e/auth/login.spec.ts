import { test, expect } from '@playwright/test';
import { 
  loginSauceDemo,
  logoutSauceDemo,
  waitForPageLoad,
  Logger,
  cleanupTest
} from '../helpers/test-helpers';
import { SELECTORS, TEST_TAGS, TEST_DATA } from '../../../utils/constants';

test.describe('Authentication Tests', () => {

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Login with valid credentials`, async ({ browser }) => {
    Logger.testStart('Login with valid credentials');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');
      
      // Verify successful login
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
      
      Logger.success('Login test completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Login with multiple valid users`, async ({ browser }) => {
    Logger.testStart('Login with multiple valid users');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      const validUsers: Array<keyof typeof TEST_DATA.SAUCEDEMO_USERS> = [
        'STANDARD_USER',
        'PROBLEM_USER', 
        'PERFORMANCE_GLITCH_USER',
        'ERROR_USER',
        'VISUAL_USER'
      ];
      
      for (const userType of validUsers) {
        Logger.phase(1, `Testing login for: ${TEST_DATA.SAUCEDEMO_USERS[userType].username}`);
        
        await loginSauceDemo(page, userType);
        await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
        
        await logoutSauceDemo(page);
        await waitForPageLoad(page);
      }
      
      Logger.success('Multiple user login test completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Login with invalid credentials shows error`, async ({ browser }) => {
    Logger.testStart('Login with invalid credentials');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('https://www.saucedemo.com');
      
      // Try invalid credentials
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, 'invalid_user');
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'invalid_password');
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      // Verify error message
      await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();
      
      Logger.success('Invalid credentials test completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Locked out user cannot login`, async ({ browser }) => {
    Logger.testStart('Locked out user cannot login');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('https://www.saucedemo.com');
      
      const lockedUser = TEST_DATA.SAUCEDEMO_USERS.LOCKED_OUT_USER;
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, lockedUser.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, lockedUser.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      // Verify locked out error message
      const errorMessage = page.locator(SELECTORS.AUTH.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('locked out');
      
      Logger.success('Locked out user test completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Logout functionality works correctly`, async ({ browser }) => {
    Logger.testStart('Logout functionality');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
      
      await logoutSauceDemo(page);
      await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();
      
      Logger.success('Logout test completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Empty credentials validation`, async ({ browser }) => {
    Logger.testStart('Empty credentials validation');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('https://www.saucedemo.com');
      
      // Try to login with empty fields
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      // Verify error message appears
      await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();

      Logger.success('Empty credentials validation completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

});