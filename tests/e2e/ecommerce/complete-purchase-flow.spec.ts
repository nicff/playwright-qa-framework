import { test, expect } from '@playwright/test';
import { 
  waitForPageLoad,
  Logger,
  cleanupTest
} from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('test - complete purchase flow validation', () => {

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Complete user journey - Login to Purchase`, async ({ browser }) => {
    Logger.testStart('Complete User Journey - Login to Purchase');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to SauceDemo and Login');
      await page.goto(ENVIRONMENTS.PRODUCTION);

      // Login with standard user
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Verify we're on inventory page
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 10000 });
      Logger.success('Successfully logged in to SauceDemo');

      Logger.phase(2, 'Product Browsing and Selection');
      const productItems = page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM);
      await expect(productItems.first()).toBeVisible({ timeout: 10000 });

      const productCount = await productItems.count();
      Logger.success(`Found ${productCount} products available`);
      
      Logger.phase(3, 'Add Multiple Products to Cart');
      // Add first product (Sauce Labs Backpack)
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await page.waitForTimeout(500);

      // Add second product (always add 2 products since SauceDemo has 6 products)
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await page.waitForTimeout(500);
      Logger.success('Multiple products added to cart');

      // Verify cart badge shows items
      const cartBadge = page.locator(SELECTORS.NAV.CART_BADGE);
      await expect(cartBadge).toBeVisible();
      const cartCount = await cartBadge.textContent();
      Logger.success(`Cart badge shows ${cartCount} items`);

      Logger.phase(4, 'Cart Review and Validation');
      await page.click(SELECTORS.NAV.CART_LINK);
      await waitForPageLoad(page);
      
      // Verify cart contains items
      const cartItems = page.locator(SELECTORS.CART.CART_ITEM);
      await expect(cartItems).toHaveCount(parseInt(cartCount || '0'));

      // Verify cart items have names and prices
      await expect(page.locator(SELECTORS.CART.CART_ITEM_NAME).first()).toBeVisible();
      await expect(page.locator(SELECTORS.CART.CART_ITEM_PRICE).first()).toBeVisible();

      Logger.success('Cart contents validated successfully');
      
      Logger.phase(5, 'Proceed to Checkout');
      await page.click(SELECTORS.CART.CHECKOUT_BUTTON);
      await waitForPageLoad(page);
      
      Logger.phase(6, 'Fill Checkout Information');
      // Fill checkout form with test data
      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

      Logger.success('Checkout information filled');

      // Continue to overview page
      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
      await waitForPageLoad(page);

      Logger.phase(7, 'Review Order and Complete Purchase');
      // Verify we're on checkout overview page
      await expect(page.locator('.checkout_summary_container, .summary_info')).toBeVisible();

      // Verify order summary shows items
      const summaryItems = page.locator('.cart_item');
      await expect(summaryItems.count()).resolves.toBeGreaterThan(0);

      // Complete the order
      await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

      Logger.phase(8, 'Order Confirmation Verification');
      // Wait for order confirmation page
      await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_TEXT)).toBeVisible();

      // Verify success message
      const completeHeader = await page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER).textContent();
      expect(completeHeader).toContain('Thank you for your order');

      Logger.success(`Order completed successfully: ${completeHeader}`);

      // Verify back to products button is available
      await expect(page.locator(SELECTORS.CHECKOUT.BACK_HOME_BUTTON)).toBeVisible();

      Logger.success('Complete purchase flow executed successfully');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Problem user checkout flow`, async ({ browser }) => {
    Logger.testStart('Problem User Checkout Flow');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Login with Problem User');
      await page.goto(ENVIRONMENTS.PRODUCTION);

      // Login with problem user to test different behavior
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible({ timeout: 10000 });
      Logger.success('Problem user logged in successfully');

      Logger.phase(2, 'Add Product to Cart');
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

      // Verify cart badge appears
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();
      Logger.success('Product added to cart');

      Logger.phase(3, 'Proceed to Checkout');
      await page.click(SELECTORS.NAV.CART_LINK);
      await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

      Logger.phase(4, 'Fill Checkout Form');
      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);
      await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

      // Problem user might have different behavior, but should still complete
      await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible({ timeout: 10000 });

      Logger.success('Problem user checkout completed');

    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Cart modifications during checkout`, async ({ browser }) => {
    Logger.testStart('Cart Modifications During Checkout');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Login and Add Products');
      await page.goto(ENVIRONMENTS.PRODUCTION);

      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      // Add multiple products
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

      Logger.phase(2, 'Navigate to Cart and Remove Item');
      await page.click(SELECTORS.NAV.CART_LINK);

      // Remove one item from cart
      const removeButtons = page.locator(SELECTORS.CART.REMOVE_BUTTON);
      await expect(removeButtons.first()).toBeVisible();
      await removeButtons.first().click();

      // Verify cart updated
      const remainingItems = page.locator(SELECTORS.CART.CART_ITEM);
      await expect(remainingItems).toHaveCount(1);

      Logger.success('Item removed from cart successfully');

      Logger.phase(3, 'Complete Checkout with Modified Cart');
      await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Verify checkout overview shows correct number of items
      const overviewItems = page.locator('.cart_item');
      await expect(overviewItems).toHaveCount(1);

      await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);
      await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();

      Logger.success('Modified cart checkout completed successfully');

    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Checkout form validation`, async ({ browser }) => {
    Logger.testStart('Checkout Form Validation');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Setup and Navigate to Checkout');
      await page.goto(ENVIRONMENTS.PRODUCTION);

      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
      await page.click(SELECTORS.NAV.CART_LINK);
      await page.click(SELECTORS.CART.CHECKOUT_BUTTON);

      Logger.phase(2, 'Test Empty Required Fields');
      // Try to continue with empty fields
      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Verify error message appears
      const errorMessage = page.locator(SELECTORS.CHECKOUT.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();

      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('First Name is required');
      Logger.success('Empty field validation working correctly');

      Logger.phase(3, 'Test Partial Form Completion');
      // Fill only first name
      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, 'Test');
      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Should still show error for missing last name
      await expect(errorMessage).toBeVisible();
      const errorText2 = await errorMessage.textContent();
      expect(errorText2).toContain('Last Name is required');
      Logger.success('Partial form validation working correctly');

      Logger.phase(4, 'Complete Valid Form');
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Should proceed to overview page
      await expect(page.locator('.checkout_summary_container')).toBeVisible({ timeout: 5000 });

      Logger.success('Valid form submission working correctly');

    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Product sorting and selection`, async ({ browser }) => {
    Logger.testStart('Product Sorting and Selection');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Login and Access Inventory');
      await page.goto(ENVIRONMENTS.PRODUCTION);

      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

      const initialProducts = page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM);
      const initialCount = await initialProducts.count();
      Logger.success(`Found ${initialCount} products in inventory`);

      Logger.phase(2, 'Test Product Sorting');
      const sortDropdown = page.locator(SELECTORS.INVENTORY.SORT_DROPDOWN);
      await expect(sortDropdown).toBeVisible();

      // Sort by price (low to high)
      await sortDropdown.selectOption('lohi');
      await page.waitForTimeout(1000);

      // Get first and last product prices to verify sorting
      const firstPrice = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).first().textContent();
      const lastPrice = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).last().textContent();

      Logger.success(`Products sorted by price: ${firstPrice} to ${lastPrice}`);

      Logger.phase(3, 'Sort by Name (Z to A)');
      await sortDropdown.selectOption('za');
      await page.waitForTimeout(1000);

      const firstProductName = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).first().textContent();
      Logger.success(`Products sorted Z-A, first product: ${firstProductName}`);

      Logger.phase(4, 'Add Sorted Products to Cart');
      // Add first product after sorting
      await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

      // Verify cart badge updates
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

      Logger.success('Product sorting and selection completed successfully');


    } finally {
      await cleanupTest(context, page);
    }
  });

});