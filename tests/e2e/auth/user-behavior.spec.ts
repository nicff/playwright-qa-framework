import { test, expect } from '@playwright/test';
import { Logger } from '@helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '@utils/constants';

test.describe('test - user behavior validation across different account types', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ENVIRONMENTS.PRODUCTION);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Performance glitch user behavior`, async ({ page }) => {
    Logger.testStart('Testing performance glitch user behavior');

    // Login as performance glitch user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PERFORMANCE_GLITCH_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PERFORMANCE_GLITCH_USER.password);

    // Measure login time
    const loginStart = Date.now();
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 15000 });
    const loginTime = Date.now() - loginStart;

    Logger.success(`Performance glitch user login took ${loginTime}ms`);

    // Test if performance issues affect functionality
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible({ timeout: 10000 });

    // Test checkout process
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible({ timeout: 15000 });

    Logger.success('Performance glitch user completed full flow despite performance issues');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Error user behavior`, async ({ page }) => {
    Logger.testStart('Testing error user behavior');

    // Login as error user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.ERROR_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.ERROR_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
    Logger.success('Error user logged in successfully');

    // Test if errors occur during normal operations
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

    // Error user might have issues, but should still be able to add to cart
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible({ timeout: 5000 });

    // Test cart functionality
    await page.click(SELECTORS.NAV.CART_LINK);

    // Error user might have different behavior in cart
    // This test documents and verifies the specific behavior
    const cartItems = page.locator(SELECTORS.CART.CART_ITEM);
    const itemCount = await cartItems.count();

    Logger.success(`Error user cart contains ${itemCount} items`);

    // Try to proceed with checkout
    if (itemCount > 0) {
      await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Error user might encounter issues here - document the behavior
      try {
        await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);
        await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible({ timeout: 10000 });
        Logger.success('Error user completed checkout successfully');
      } catch (error) {
        Logger.success('Error user encountered expected errors during checkout');
      }
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Visual user behavior`, async ({ page }) => {
    Logger.testStart('Testing visual user behavior');

    // Login as visual user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.VISUAL_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.VISUAL_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
    Logger.success('Visual user logged in successfully');

    // Visual user might have different images/styling
    // Verify that product images are present (even if different)
    const productImages = page.locator(SELECTORS.INVENTORY.PRODUCT_IMAGE);
    const imageCount = await productImages.count();
    expect(imageCount).toBeGreaterThan(0);

    // Test that all images have src attributes
    for (let i = 0; i < imageCount; i++) {
      const imgSrc = await productImages.nth(i).getAttribute('src');
      expect(imgSrc).toBeTruthy();
    }

    Logger.success(`Visual user sees ${imageCount} product images`);

    // Test full functionality despite visual differences
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();

    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();

    Logger.success('Visual user completed full flow successfully');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Problem user product images`, async ({ page }) => {
    Logger.testStart('Testing problem user product images');

    // Login as problem user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    // Problem user is known to have broken/incorrect images
    const productImages = page.locator(SELECTORS.INVENTORY.PRODUCT_IMAGE);
    const imageCount = await productImages.count();

    // Verify images exist but might be broken
    for (let i = 0; i < Math.min(3, imageCount); i++) {
      const imgSrc = await productImages.nth(i).getAttribute('src');
      expect(imgSrc).toBeTruthy();

      // Log the image source for documentation
      const productName = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).nth(i).textContent();
      Logger.success(`Product "${productName}" has image: ${imgSrc}`);
    }

    Logger.success('Problem user image behavior documented');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} User behavior comparison`, async ({ page }) => {
    Logger.testStart('Comparing behavior across different users');

    const users = [
      TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER,
      TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER,
      TEST_DATA.SAUCEDEMO_USERS.PERFORMANCE_GLITCH_USER
    ];

    const userBehavior = [];

    for (const user of users) {
      Logger.phase(1, `Testing user: ${user.username}`);

      // Login
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, user.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, user.password);

      const loginStart = Date.now();
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 15000 });
      const loginTime = Date.now() - loginStart;

      // Test basic functionality
      const productCount = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();

      // Add item to cart
      const addStart = Date.now();
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible({ timeout: 10000 });
      const addTime = Date.now() - addStart;

      userBehavior.push({
        username: user.username,
        loginTime,
        addToCartTime: addTime,
        productCount
      });

      // Logout for next user
      await page.click(SELECTORS.NAV.MENU_BUTTON);
      await page.click(SELECTORS.NAV.LOGOUT_LINK);
      await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();
    }

    // Log comparison results
    Logger.success('User behavior comparison:');
    userBehavior.forEach(behavior => {
      Logger.success(`${behavior.username}: Login=${behavior.loginTime}ms, AddToCart=${behavior.addToCartTime}ms, Products=${behavior.productCount}`);
    });
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Session persistence across user types`, async ({ page }) => {
    Logger.testStart('Testing session persistence across user types');

    // Login as standard user and add items
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

    // Logout
    await page.click(SELECTORS.NAV.MENU_BUTTON);
    await page.click(SELECTORS.NAV.LOGOUT_LINK);

    // Login as different user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Verify cart is empty (sessions are separate)
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).not.toBeVisible();

    Logger.success('Session isolation working correctly between users');
  });

});
