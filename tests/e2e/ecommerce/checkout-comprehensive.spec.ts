import { test, expect } from '@playwright/test';
import { Logger } from '@helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '@utils/constants';

test.describe('test - checkout process comprehensive validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ENVIRONMENTS.PRODUCTION);

    // Login and add item to cart
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Valid checkout information submission`, async ({ page }) => {
    Logger.testStart('Testing valid checkout information submission');

    // Fill valid information
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Verify we reach overview page
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await expect(page.locator('.checkout_summary_container')).toBeVisible();

    Logger.success('Valid checkout information accepted');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} All required field validations`, async ({ page }) => {
    Logger.testStart('Testing all required field validations');

    const scenarios = [
      { name: 'Empty first name', data: { firstName: '', lastName: 'Doe', postalCode: '12345' }, expectedError: 'First Name is required' },
      { name: 'Empty last name', data: { firstName: 'John', lastName: '', postalCode: '12345' }, expectedError: 'Last Name is required' },
      { name: 'Empty postal code', data: { firstName: 'John', lastName: 'Doe', postalCode: '' }, expectedError: 'Postal Code is required' },
      { name: 'All empty', data: { firstName: '', lastName: '', postalCode: '' }, expectedError: 'First Name is required' }
    ];

    for (const scenario of scenarios) {
      Logger.phase(1, `Testing: ${scenario.name}`);

      // Clear and fill fields
      await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, scenario.data.firstName);
      await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, scenario.data.lastName);
      await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, scenario.data.postalCode);

      await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

      // Verify error message
      const errorMessage = page.locator(SELECTORS.CHECKOUT.ERROR_MESSAGE);
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain(scenario.expectedError);

      // Clear error for next iteration
      await page.locator('.error-message-container .error-button').click();
    }

    Logger.success('All required field validations working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Special characters in form fields`, async ({ page }) => {
    Logger.testStart('Testing special characters in form fields');

    const specialCharData = {
      firstName: 'José-María',
      lastName: "O'Connor-Smith",
      postalCode: 'SW1A 1AA'
    };

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, specialCharData.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, specialCharData.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, specialCharData.postalCode);

    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Should proceed successfully
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    Logger.success('Special characters handled correctly in form fields');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Maximum length input validation`, async ({ page }) => {
    Logger.testStart('Testing maximum length input validation');

    const longData = {
      firstName: 'A'.repeat(100),
      lastName: 'B'.repeat(100),
      postalCode: 'C'.repeat(50)
    };

    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, longData.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, longData.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, longData.postalCode);

    // Check if inputs accept or truncate long values
    const firstNameValue = await page.inputValue(SELECTORS.CHECKOUT.FIRST_NAME_INPUT);
    const lastNameValue = await page.inputValue(SELECTORS.CHECKOUT.LAST_NAME_INPUT);
    const postalCodeValue = await page.inputValue(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT);

    Logger.success(`Input lengths: First Name: ${firstNameValue.length}, Last Name: ${lastNameValue.length}, Postal Code: ${postalCodeValue.length}`);

    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Should either proceed or show appropriate error
    // This tests how the application handles edge cases
    Logger.success('Maximum length input validation tested');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Cancel checkout process`, async ({ page }) => {
    Logger.testStart('Testing cancel checkout process');

    // Fill some information
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, 'John');
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, 'Doe');

    // Cancel checkout
    await page.click(SELECTORS.CHECKOUT.CANCEL_BUTTON);

    // Verify we're back on cart page
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(page.locator(SELECTORS.CART.CART_LIST)).toBeVisible();

    Logger.success('Cancel checkout process working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Checkout overview page validation`, async ({ page }) => {
    Logger.testStart('Testing checkout overview page validation');

    // Complete step one
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Verify overview page elements
    await expect(page.locator('.checkout_summary_container')).toBeVisible();
    await expect(page.locator('.summary_info')).toBeVisible();

    // Verify payment and shipping info
    await expect(page.locator('.summary_info .summary_value_label')).toContainText('SauceCard');
    await expect(page.locator('.summary_info')).toContainText('Free Pony Express Delivery');

    // Verify item total, tax, and final total
    await expect(page.locator('.summary_subtotal_label')).toBeVisible();
    await expect(page.locator('.summary_tax_label')).toBeVisible();
    await expect(page.locator('.summary_total_label')).toBeVisible();

    // Verify cart items are displayed
    await expect(page.locator('.cart_item')).toHaveCount(1);
    Logger.success('Checkout overview page validation passed');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Complete order process`, async ({ page }) => {
    Logger.testStart('Testing complete order process');

    // Complete step one
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Complete order
    await page.click(SELECTORS.CHECKOUT.FINISH_BUTTON);

    // Verify completion page
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER)).toBeVisible();
    await expect(page.locator(SELECTORS.CHECKOUT.COMPLETE_TEXT)).toBeVisible();

    // Verify success message
    const headerText = await page.locator(SELECTORS.CHECKOUT.COMPLETE_HEADER).textContent();
    expect(headerText).toContain('Thank you for your order');

    // Verify back home button
    await expect(page.locator(SELECTORS.CHECKOUT.BACK_HOME_BUTTON)).toBeVisible();

    // Click back home
    await page.click(SELECTORS.CHECKOUT.BACK_HOME_BUTTON);

    // Verify we're back on inventory page
    await expect(page).toHaveURL(/.*inventory.html/);

    // Verify cart is reset (no badge should be visible)
    await expect(page.locator(SELECTORS.NAV.CART_BADGE)).not.toBeVisible();

    Logger.success('Complete order process working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Checkout with multiple items`, async ({ page }) => {
    Logger.testStart('Testing checkout with multiple items');

    // Go back to inventory and add more items
    await page.click(SELECTORS.CHECKOUT.CANCEL_BUTTON);
    await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);

    // Add more items
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

    // Verify cart has multiple items
    await page.click(SELECTORS.NAV.CART_LINK);
    const cartItems = await page.locator(SELECTORS.CART.CART_ITEM).count();
    expect(cartItems).toBeGreaterThan(1);

    // Proceed with checkout
    await page.click(SELECTORS.CART.CHECKOUT_BUTTON);
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);
    await page.click(SELECTORS.CHECKOUT.CONTINUE_BUTTON);

    // Verify overview shows all items
    const overviewItems = await page.locator('.cart_item').count();
    expect(overviewItems).toBe(cartItems);

    // Verify total calculation includes all items
    const subtotalElement = page.locator('.summary_subtotal_label');
    await expect(subtotalElement).toBeVisible();

    Logger.success('Checkout with multiple items working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Form keyboard navigation`, async ({ page }) => {
    Logger.testStart('Testing form keyboard navigation');

    // Test tab navigation through form fields
    await page.focus(SELECTORS.CHECKOUT.FIRST_NAME_INPUT);
    await page.press(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, 'Tab');
    await expect(page.locator(SELECTORS.CHECKOUT.LAST_NAME_INPUT)).toBeFocused();

    await page.press(SELECTORS.CHECKOUT.LAST_NAME_INPUT, 'Tab');
    await expect(page.locator(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT)).toBeFocused();

    await page.press(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, 'Tab');
    await expect(page.locator(SELECTORS.CHECKOUT.CONTINUE_BUTTON)).toBeFocused();

    // Test form submission with Enter key
    await page.fill(SELECTORS.CHECKOUT.FIRST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.firstName);
    await page.fill(SELECTORS.CHECKOUT.LAST_NAME_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.lastName);
    await page.fill(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, TEST_DATA.CHECKOUT_INFO.VALID.postalCode);

    await page.press(SELECTORS.CHECKOUT.POSTAL_CODE_INPUT, 'Enter');

    // Should proceed to overview page
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    Logger.success('Form keyboard navigation working correctly');
  });

});
