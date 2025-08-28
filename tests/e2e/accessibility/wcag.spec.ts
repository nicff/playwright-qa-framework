import { test, expect } from '@playwright/test';
import {
  loginSauceDemo,
  Logger,
  cleanupTest
} from '@helpers/test-helpers';
import { SELECTORS, TEST_TAGS } from '@utils/constants';

test.describe('test - basic accessibility validation', () => {

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Login form has proper labels and accessibility`, async ({ browser }) => {
    Logger.testStart('Login form accessibility verification');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.saucedemo.com');

      // Check form elements have proper attributes
      const usernameInput = page.locator(SELECTORS.AUTH.USERNAME_INPUT);
      const passwordInput = page.locator(SELECTORS.AUTH.PASSWORD_INPUT);
      const loginButton = page.locator(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify inputs have proper attributes
      await expect(usernameInput).toHaveAttribute('placeholder');
      await expect(passwordInput).toHaveAttribute('placeholder');
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Verify button is properly labeled
      await expect(loginButton).toHaveAttribute('value');

      Logger.success('Login form accessibility verified');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product inventory accessibility`, async ({ browser }) => {
    Logger.testStart('Product inventory accessibility verification');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Check product images have alt text
      const productImages = page.locator(SELECTORS.INVENTORY.PRODUCT_IMAGE);
      const imageCount = await productImages.count();

      for (let i = 0; i < Math.min(3, imageCount); i++) {
        const altText = await productImages.nth(i).getAttribute('alt');
        expect(altText).toBeTruthy();
      }

      // Check product titles are properly structured
      const productTitles = page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE);
      await expect(productTitles.first()).toBeVisible();

      // Check buttons have proper text
      const addButtons = page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON);
      const buttonText = await addButtons.first().textContent();
      expect(buttonText).toContain('Add to cart');

      Logger.success('Product inventory accessibility verified');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Navigation accessibility`, async ({ browser }) => {
    Logger.testStart('Navigation accessibility verification');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Check menu button is accessible
      const menuButton = page.locator(SELECTORS.NAV.MENU_BUTTON);
      await expect(menuButton).toBeVisible();

      // Open menu and check menu items
      await menuButton.click();

      const menuItems = [
        SELECTORS.NAV.ALL_ITEMS_LINK,
        SELECTORS.NAV.ABOUT_LINK,
        SELECTORS.NAV.LOGOUT_LINK,
        SELECTORS.NAV.RESET_APP_LINK
      ];

      for (const menuItem of menuItems) {
        await expect(page.locator(menuItem)).toBeVisible();
        const linkText = await page.locator(menuItem).textContent();
        expect(linkText).toBeTruthy();
      }

      Logger.success('Navigation accessibility verified');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Keyboard navigation support`, async ({ browser }) => {
    Logger.testStart('Keyboard navigation verification');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.saucedemo.com');

      // Test Tab navigation through login form
      await page.press('body', 'Tab');
      await expect(page.locator(SELECTORS.AUTH.USERNAME_INPUT)).toBeFocused();

      await page.press('body', 'Tab');
      await expect(page.locator(SELECTORS.AUTH.PASSWORD_INPUT)).toBeFocused();

      await page.press('body', 'Tab');
      await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeFocused();

      Logger.success('Keyboard navigation working correctly');
    } finally {
      await cleanupTest(context, page);
    }
  });

});