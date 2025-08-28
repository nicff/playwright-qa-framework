import { test, expect } from '@playwright/test';
import {
  Logger,
  cleanupTest
} from '@helpers/test-helpers';
import { SELECTORS, TEST_TAGS, TEST_DATA } from '@utils/constants';

test.describe('test - password security validation', () => {

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Password field is masked`, async ({ browser }) => {
    Logger.testStart('Password field masking verification');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.saucedemo.com');

      // Verify password field is of type "password"
      const passwordInput = page.locator(SELECTORS.AUTH.PASSWORD_INPUT);
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');

      // Type password and verify it's masked
      await passwordInput.fill('test_password');
      const value = await passwordInput.inputValue();
      expect(value).toBe('test_password'); // Value is there but visually masked

      Logger.success('Password field properly masked');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Password cannot be empty`, async ({ browser }) => {
    Logger.testStart('Empty password validation');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.saucedemo.com');

      // Try to login with username but empty password
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify error message appears
      await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();

      Logger.success('Empty password validation working correctly');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Username cannot be empty`, async ({ browser }) => {
    Logger.testStart('Empty username validation');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.saucedemo.com');

      // Try to login with password but empty username
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify error message appears
      await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();

      Logger.success('Empty username validation working correctly');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Case sensitive username validation`, async ({ browser }) => {
    Logger.testStart('Case sensitive username validation');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.saucedemo.com');

      // Try login with wrong case username
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, 'STANDARD_USER'); // uppercase
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Should show error (SauceDemo usernames are case sensitive)
      await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();

      Logger.success('Case sensitive validation working correctly');
    } finally {
      await cleanupTest(context, page);
    }
  });

});