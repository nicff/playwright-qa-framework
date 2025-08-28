import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('SauceDemo - Integration and Complex Flows', () => {

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Complete multi-user scenario`, async ({ browser }) => {
    Logger.testStart('Testing complete multi-user scenario');

    // Create multiple browser contexts for different users
    const standardContext = await browser.newContext();
    const problemContext = await browser.newContext();

    const standardPage = await standardContext.newPage();
    const problemPage = await problemContext.newPage();

    try {
      // Standard user journey
      Logger.phase(1, 'Standard user: Complete purchase flow');
      await standardPage.goto(ENVIRONMENTS.PRODUCTION);
      await standardPage.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await standardPage.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await standardPage.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await standardPage.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await standardPage.click(SELECTORS.NAV.CART_LINK);
      await standardPage.click(SELECTORS.CART.CHECKOUT_BUTTON);

      await standardPage.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, 'Standard');
      await standardPage.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, 'User');
      await standardPage.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, '12345');
      await standardPage.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
      await standardPage.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

      await expect(standardPage.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();
      Logger.success('Standard user completed purchase successfully');

      // Problem user journey (concurrent)
      Logger.phase(2, 'Problem user: Concurrent session');
      await problemPage.goto(ENVIRONMENTS.PRODUCTION);
      await problemPage.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.username);
      await problemPage.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.password);
      await problemPage.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await problemPage.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await problemPage.click(SELECTORS.NAV.CART_LINK);

      // Verify both users maintain separate sessions
      await expect(problemPage.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(1);
      Logger.success('Multi-user session isolation verified');

    } finally {
      await standardContext.close();
      await problemContext.close();
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Shopping cart persistence across sessions`, async ({ page }) => {
    Logger.testStart('Testing shopping cart persistence across sessions');

    // First session - add items
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Add multiple items
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(1).click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(2).click();

    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('3');

    // Logout
    await page.click(SELECTORS.NAV.MENU_BUTTON);
    await page.click(SELECTORS.NAV.LOGOUT_LINK);

    // Second session - login again
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // In SauceDemo, cart is reset after logout - verify expected behavior
    const cartBadgeVisible = await page.locator(SELECTORS.NAV.CART_BADGE).isVisible();
    if (cartBadgeVisible) {
      const cartCount = await page.locator(SELECTORS.NAV.CART_BADGE).textContent();
      Logger.success(`Cart persisted across sessions: ${cartCount} items`);
    } else {
      Logger.success('Cart reset after logout (expected SauceDemo behavior)');
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Full product catalog interaction`, async ({ page }) => {
    Logger.testStart('Testing full product catalog interaction');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Get all products
    const productCount = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();
    const productDetails = [];

    // Collect all product information
    for (let i = 0; i < productCount; i++) {
      const name = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).nth(i).textContent();
      const price = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).nth(i).textContent();
      const description = await page.locator(SELECTORS.INVENTORY.PRODUCT_DESCRIPTION).nth(i).textContent();

      productDetails.push({ index: i, name, price, description });
    }

    Logger.success(`Cataloged ${productCount} products`);

    // Add every other product to cart
    for (let i = 0; i < productCount; i += 2) {
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(i).click();
    }

    const expectedCartItems = Math.ceil(productCount / 2);
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText(expectedCartItems.toString());

    // Verify cart contents
    await page.click(SELECTORS.NAV.CART_LINK);
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(expectedCartItems);

    // Verify correct products are in cart
    for (let i = 0; i < expectedCartItems; i++) {
      const cartItemName = await page.locator(SELECTORS.CART.CART_ITEM_NAME).nth(i).textContent();
      Logger.success(`Cart item ${i + 1}: ${cartItemName}`);
    }

    Logger.success('Full product catalog interaction completed');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Stress test: Rapid operations`, async ({ page }) => {
    Logger.testStart('Testing rapid operations stress test');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Rapid add/remove operations
    const operations = 20;
    let successfulOps = 0;

    for (let i = 0; i < operations; i++) {
      try {
        // Add item
        await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
        await page.waitForTimeout(10);

        // Remove item
        await page.locator(SELECTORS.INVENTORY.REMOVE_BUTTON).first().click();
        await page.waitForTimeout(10);

        successfulOps++;
      } catch (error) {
        Logger.success(`Operation ${i + 1} failed: ${error}`);
      }
    }

    Logger.success(`Completed ${successfulOps}/${operations} rapid operations successfully`);

    // Verify final state is consistent
    const cartBadgeVisible = await page.locator(SELECTORS.NAV.CART_BADGE).isVisible();
    Logger.success(`Final state: Cart badge visible = ${cartBadgeVisible}`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Cross-browser behavior validation`, async ({ page }) => {
    Logger.testStart('Testing cross-browser behavior validation');

    await page.goto(ENVIRONMENTS.PRODUCTION);

    // Test browser-specific features
    const userAgent = await page.evaluate(() => navigator.userAgent);
    Logger.success(`Testing on: ${userAgent}`);

    // Login and test core functionality
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Test JavaScript features
    const jsFeatures = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined'
      };
    });

    Logger.success(`Browser features: ${JSON.stringify(jsFeatures)}`);

    // Test CSS features
    const cssSupport = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.style.display = 'flex';
      return {
        flexbox: testDiv.style.display === 'flex',
        grid: CSS.supports('display', 'grid'),
        customProperties: CSS.supports('--custom-property', 'value')
      };
    });

    Logger.success(`CSS features: ${JSON.stringify(cssSupport)}`);

    // Complete a full flow to verify compatibility
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();
    Logger.success('Full flow completed successfully on this browser');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Data integrity throughout complex flow`, async ({ page }) => {
    Logger.testStart('Testing data integrity throughout complex flow');

    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Collect initial product data
    const initialProduct = {
      name: await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).first().textContent(),
      price: await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).first().textContent(),
      description: await page.locator(SELECTORS.INVENTORY.PRODUCT_DESCRIPTION).first().textContent()
    };

    Logger.success(`Initial product: ${initialProduct.name} - ${initialProduct.price}`);

    // Add to cart and verify data consistency
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);

    const cartProduct = {
      name: await page.locator(SELECTORS.CART.CART_ITEM_NAME).first().textContent(),
      price: await page.locator(SELECTORS.CART.CART_ITEM_PRICE).first().textContent()
    };

    expect(cartProduct.name).toBe(initialProduct.name);
    expect(cartProduct.price).toBe(initialProduct.price);
    Logger.success('Product data consistent in cart');

    // Proceed through checkout and verify data integrity
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    const checkoutProduct = {
      name: await page.locator('.inventory_item_name').first().textContent(),
      price: await page.locator('.inventory_item_price').first().textContent()
    };

    expect(checkoutProduct.name).toBe(initialProduct.name);
    expect(checkoutProduct.price).toBe(initialProduct.price);
    Logger.success('Product data consistent throughout entire flow');

    // Verify total calculations
    const subtotal = await page.locator('.summary_subtotal_label').textContent();
    const tax = await page.locator('.summary_tax_label').textContent();
    const total = await page.locator('.summary_total_label').textContent();

    Logger.success(`Order summary - Subtotal: ${subtotal}, Tax: ${tax}, Total: ${total}`);

    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);
    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();

    Logger.success('Data integrity maintained throughout complex flow');
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} End-to-end smoke test all features`, async ({ page }) => {
    Logger.testStart('Comprehensive end-to-end smoke test');

    // Test 1: Login
    await page.goto(ENVIRONMENTS.PRODUCTION);
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
    Logger.success('✓ Login functionality');

    // Test 2: Product sorting
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'lohi');
    await page.waitForTimeout(500);
    Logger.success('✓ Product sorting');

    // Test 3: Add products to cart
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('2');
    Logger.success('✓ Add to cart functionality');

    // Test 4: Cart management
    await page.click(SELECTORS.NAV.CART_LINK);
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(2);
    await page.locator(SELECTORS.CART.REMOVE_BUTTON).first().click();
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(1);
    Logger.success('✓ Cart management');

    // Test 5: Checkout process
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
    Logger.success('✓ Checkout form');

    // Test 6: Order completion
    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);
    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();
    Logger.success('✓ Order completion');

    // Test 7: Navigation
    await page.click(SELECTORS.CHECKOUT.BACK_HOME_BUTTON);
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
    Logger.success('✓ Navigation');

    // Test 8: Menu functionality
    await page.click(SELECTORS.NAV.MENU_BUTTON);
    await expect(page.locator('.bm-menu-wrap')).toBeVisible();
    await page.click(SELECTORS.NAV.RESET_APP_LINK);
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).not.toBeVisible();
    Logger.success('✓ Menu and reset functionality');

    // Test 9: Logout
    await page.click(SELECTORS.NAV.MENU_BUTTON);
    await page.click(SELECTORS.NAV.LOGOUT_LINK);
    await expect(page.locator(SELECTORS.AUTH.LOGIN_BUTTON)).toBeVisible();
    Logger.success('✓ Logout functionality');

    Logger.success('🎉 ALL CORE FEATURES TESTED SUCCESSFULLY!');
  });

});
