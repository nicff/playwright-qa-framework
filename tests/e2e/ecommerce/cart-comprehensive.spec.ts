import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('test - shopping cart functionality validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ENVIRONMENTS.PRODUCTION);

    // Login as standard user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Add single item to cart`, async ({ page }) => {
    Logger.testStart('Testing add single item to cart');

    // Get product info before adding
    const productName = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).first().textContent();
    const productPrice = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).first().textContent();

    // Add product to cart
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

    // Verify cart badge appears
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

    // Verify button changes to Remove
    await expect(page.locator(SELECTORS.INVENTORY.REMOVE_BUTTON).first()).toBeVisible();

    // Navigate to cart
    await page.click(SELECTORS.NAV.CART_LINK);

    // Verify item is in cart with correct details
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(1);
    await expect(page.locator(SELECTORS.CART.CART_ITEM_NAME).first()).toContainText(productName || '');
    await expect(page.locator(SELECTORS.CART.CART_ITEM_PRICE).first()).toContainText(productPrice || '');

    Logger.success('Single item added to cart successfully');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Add all products to cart`, async ({ page }) => {
    Logger.testStart('Testing add all products to cart');

    // Get total number of products
    const totalProducts = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();

    // Add all products to cart one by one
    for (let i = 0; i < totalProducts; i++) {
      // Always click the first available "Add to Cart" button
      const addButton = page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first();
      await addButton.click();
      await page.waitForTimeout(200); // Small delay to ensure state updates
    }

    // Verify cart badge shows correct count
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText(totalProducts.toString());

    // Verify all buttons changed to Remove
    const removeButtons = page.locator(SELECTORS.INVENTORY.REMOVE_BUTTON);
    await expect(removeButtons).toHaveCount(totalProducts);

    // Navigate to cart
    await page.click(SELECTORS.NAV.CART_LINK);

    // Verify all items are in cart
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(totalProducts);

    Logger.success(`All ${totalProducts} products added to cart successfully`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Remove items from inventory page`, async ({ page }) => {
    Logger.testStart('Testing remove items from inventory page');

    // Add multiple items
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(1).click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(2).click();

    // Verify cart badge shows 3
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('3');

    // Remove one item
    await page.locator(SELECTORS.INVENTORY.REMOVE_BUTTON).first().click();

    // Verify cart badge updates to 2
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('2');

    // Verify button changed back to Add to Cart
    await expect(page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first()).toBeVisible();

    Logger.success('Remove from inventory page working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Remove items from cart page`, async ({ page }) => {
    Logger.testStart('Testing remove items from cart page');

    // Add multiple items
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(1).click();

    // Navigate to cart
    await page.click(SELECTORS.NAV.CART_LINK);

    // Verify 2 items in cart
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(2);

    // Remove one item from cart
    await page.locator(SELECTORS.CART.REMOVE_BUTTON).first().click();

    // Verify only 1 item remains
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(1);

    // Verify cart badge updates
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

    Logger.success('Remove from cart page working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Empty cart state`, async ({ page }) => {
    Logger.testStart('Testing empty cart state');

    // Navigate to cart (empty by default)
    await page.click(SELECTORS.NAV.CART_LINK);

    // Verify empty cart state
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(0);

    // Verify checkout button is still present but continue shopping works
    await expect(page.locator(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON)).toBeVisible();
    await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);

    // Verify we're back on inventory page
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    Logger.success('Empty cart state handled correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cart persistence across pages`, async ({ page }) => {
    Logger.testStart('Testing cart persistence across page navigation');

    // Add items to cart
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(1).click();

    // Navigate to cart
    await page.click(SELECTORS.NAV.CART_LINK);
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(2);

    // Go back to inventory
    await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);

    // Verify cart badge still shows 2
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('2');

    // Navigate to cart again
    await page.click(SELECTORS.NAV.CART_LINK);

    // Verify items are still there
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(2);

    Logger.success('Cart persistence working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cart quantity display`, async ({ page }) => {
    Logger.testStart('Testing cart quantity display');

    // Add first product
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

    // Navigate to cart
    await page.click(SELECTORS.NAV.CART_LINK);

    // Verify quantity is shown as 1
    await expect(page.locator(SELECTORS.CART.CART_QUANTITY).first()).toHaveText('1');

    // Go back and verify we can't add same item again (button should be Remove)
    await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);
    await expect(page.locator(SELECTORS.INVENTORY.REMOVE_BUTTON).first()).toBeVisible();

    Logger.success('Cart quantity display working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cart with problem user`, async ({ page }) => {
    Logger.testStart('Testing cart functionality with problem user');

    // Logout and login as problem user
    await page.click(SELECTORS.NAV.MENU_BUTTON);
    await page.click(SELECTORS.NAV.LOGOUT_LINK);

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Add item to cart (problem user might have different behavior)
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

    // Verify cart functionality still works
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();

    await page.click(SELECTORS.NAV.CART_LINK);
    await expect(page.locator(SELECTORS.CART.CART_ITEM)).toHaveCount(1);

    Logger.success('Cart functionality works with problem user');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Continue shopping from cart`, async ({ page }) => {
    Logger.testStart('Testing continue shopping functionality');

    // Add item and go to cart
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);

    // Click continue shopping
    await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);

    // Verify we're back on inventory page
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

    // Verify cart badge is still there
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

    Logger.success('Continue shopping functionality working correctly');
  });

});
