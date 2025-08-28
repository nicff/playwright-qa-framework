import { test, expect } from '@playwright/test';
import { Logger } from '@helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '@utils/constants';

test.describe('test - comprehensive login scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ENVIRONMENTS.PRODUCTION);
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} ${TEST_TAGS.CRITICAL} All valid users can login successfully`, async ({ page }) => {
    Logger.testStart('Testing all valid SauceDemo users');

    const users = Object.values(TEST_DATA.SAUCEDEMO_USERS);

    for (const user of users) {
      if (user.username === 'locked_out_user') continue; // Skip locked user for this test

      Logger.phase(1, `Testing login for user: ${user.username}`);

      // Clear fields
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, '');
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, '');

      // Login
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, user.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, user.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify successful login
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 10000 });
      Logger.success(`${user.username} logged in successfully`);

      // Logout for next iteration
      await page.click(SELECTORS.NAV.MENU_BUTTON);
      await page.click(SELECTORS.NAV.LOGOUT_LINK);
      await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Locked out user receives proper error`, async ({ page }) => {
    Logger.testStart('Testing locked out user behavior');

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.LOCKED_OUT_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.LOCKED_OUT_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Verify error message
    const errorMessage = page.locator(SELECTORS.AUTH.ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();

    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('locked out');
    Logger.success('Locked out user error message displayed correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Invalid credentials show error`, async ({ page }) => {
    Logger.testStart('Testing invalid login credentials');

    const invalidCreds = [
      { username: 'invalid_user', password: 'invalid_password' },
      { username: 'standard_user', password: 'wrong_password' },
      { username: 'wrong_user', password: 'secret_sauce' },
      { username: '', password: 'secret_sauce' },
      { username: 'standard_user', password: '' }
    ];

    for (const cred of invalidCreds) {
      Logger.phase(1, `Testing credentials: ${cred.username || 'empty'} / ${cred.password || 'empty'}`);

      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, cred.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, cred.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify error message appears
      const errorMessage = page.locator(SELECTORS.AUTH.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();

      // Clear error and fields for next iteration
      await page.locator('.error-message-container .error-button').click();
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, '');
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, '');
    }

    Logger.success('All invalid credential scenarios handled correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Error message can be dismissed`, async ({ page }) => {
    Logger.testStart('Testing error message dismissal');

    // Generate error
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, 'invalid');
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'invalid');
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Verify error appears
    await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).toBeVisible();

    // Click X button to dismiss
    await page.locator('.error-message-container .error-button').click();

    // Verify error is dismissed
    await expect(page.locator(SELECTORS.AUTH.ERROR_MESSAGE)).not.toBeVisible();
    Logger.success('Error message dismissed successfully');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Login form validation`, async ({ page }) => {
    Logger.testStart('Testing login form validation');

    // Test tab navigation
    await page.press(SELECTORS.AUTH.USERNAME_INPUT, 'Tab');
    await expect(page.locator(SELECTORS.AUTH.PASSWORD_INPUT)).toBeFocused();

    await page.press(SELECTORS.AUTH.PASSWORD_INPUT, 'Tab');
    await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeFocused();

    // Test Enter key submission
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.press(SELECTORS.AUTH.PASSWORD_INPUT, 'Enter');

    // Verify login successful
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 10000 });
    Logger.success('Login form validation and keyboard navigation working correctly');
  });

});
