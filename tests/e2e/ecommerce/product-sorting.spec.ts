import { test, expect } from '@playwright/test';
import { Logger } from '../helpers/test-helpers';
import {
  SELECTORS,
  TEST_TAGS,
  TEST_DATA,
  ENVIRONMENTS
} from '../../../utils/constants';

test.describe('test - product sorting and filtering validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(ENVIRONMENTS.PRODUCTION);

    // Login as standard user
    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.STANDARD_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Default product sorting (A to Z)`, async ({ page }) => {
    Logger.testStart('Testing default product sorting A to Z');

    // Get all product names
    const productNames = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).allTextContents();

    // Verify they are sorted A to Z
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);

    // Verify dropdown shows correct default value
    const sortValue = await page.locator(SELECTORS.INVENTORY.SORT_DROPDOWN).inputValue();
    expect(sortValue).toBe('az');

    Logger.success('Default A to Z sorting verified');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sort by Name Z to A`, async ({ page }) => {
    Logger.testStart('Testing sort by Name Z to A');

    // Sort by Z to A
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'za');
    await page.waitForTimeout(500);

    // Get product names after sorting
    const productNames = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).allTextContents();

    // Verify they are sorted Z to A
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);

    Logger.success('Z to A sorting working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sort by Price Low to High`, async ({ page }) => {
    Logger.testStart('Testing sort by Price Low to High');

    // Sort by price low to high
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'lohi');
    await page.waitForTimeout(500);

    // Get all prices and convert to numbers
    const priceTexts = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).allTextContents();
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    // Verify they are sorted low to high
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);

    Logger.success(`Price sorting Low to High: $${prices[0]} to $${prices[prices.length - 1]}`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sort by Price High to Low`, async ({ page }) => {
    Logger.testStart('Testing sort by Price High to Low');

    // Sort by price high to low
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'hilo');
    await page.waitForTimeout(500);

    // Get all prices and convert to numbers
    const priceTexts = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).allTextContents();
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    // Verify they are sorted high to low
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);

    Logger.success(`Price sorting High to Low: $${prices[0]} to $${prices[prices.length - 1]}`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sorting persistence with cart operations`, async ({ page }) => {
    Logger.testStart('Testing sorting behavior during cart operations');

    // Sort by price high to low
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'hilo');
    await page.waitForTimeout(500);

    // Get first product name after sorting
    const firstProductName = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).first().textContent();

    // Add product to cart
    await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).first().click();

    // Navigate to cart and back
    await page.click(SELECTORS.NAV.CART_LINK);
    await page.click(SELECTORS.CART.CONTINUE_SHOPPING_BUTTON);

    // Verify sorting resets to default (SauceDemo behavior)
    const sortValue = await page.locator(SELECTORS.INVENTORY.SORT_DROPDOWN).inputValue();
    expect(sortValue).toBe('az'); // SauceDemo resets to default A-Z sorting

    // Verify we can re-apply sorting and it works
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'hilo');
    await page.waitForTimeout(500);

    const newFirstProductName = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).first().textContent();
    expect(newFirstProductName).toBe(firstProductName); // Should be same as before

    Logger.success('Sorting behavior during cart operations documented and working correctly');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sorting with different users`, async ({ page }) => {
    Logger.testStart('Testing sorting with problem user');

    // Logout and login as problem user
    await page.click(SELECTORS.NAV.MENU_BUTTON);
    await page.click(SELECTORS.NAV.LOGOUT_LINK);

    await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.username);
    await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TEST_DATA.SAUCEDEMO_USERS.PROBLEM_USER.password);
    await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

    // Verify sorting still works
    await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, 'lohi');
    await page.waitForTimeout(500);

    // Get prices and verify sorting
    const priceTexts = await page.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).allTextContents();
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);

    Logger.success('Sorting works correctly with problem user');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} All sorting options validation`, async ({ page }) => {
    Logger.testStart('Testing all sorting options');

    const sortOptions = [
      { value: 'az', name: 'Name (A to Z)' },
      { value: 'za', name: 'Name (Z to A)' },
      { value: 'lohi', name: 'Price (low to high)' },
      { value: 'hilo', name: 'Price (high to low)' }
    ];

    for (const option of sortOptions) {
      Logger.phase(1, `Testing sort option: ${option.name}`);

      await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, option.value);
      await page.waitForTimeout(500);

      // Verify the option is selected
      const currentValue = await page.locator(SELECTORS.INVENTORY.SORT_DROPDOWN).inputValue();
      expect(currentValue).toBe(option.value);

      // Verify products are displayed
      const productCount = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();
      expect(productCount).toBeGreaterThan(0);

      Logger.success(`${option.name} option working correctly`);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product count consistency across sorting`, async ({ page }) => {
    Logger.testStart('Testing product count consistency across all sorting options');

    // Get initial product count
    const initialCount = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();

    const sortOptions = ['az', 'za', 'lohi', 'hilo'];

    for (const option of sortOptions) {
      await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, option);
      await page.waitForTimeout(500);

      const currentCount = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).count();
      expect(currentCount).toBe(initialCount);
    }

    Logger.success(`Product count consistent: ${initialCount} products across all sorting options`);
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product details integrity during sorting`, async ({ page }) => {
    Logger.testStart('Testing product details integrity during sorting');

    // Collect all product data initially
    const initialProducts = [];
    const productElements = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).all();

    for (const element of productElements) {
      const name = await element.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).textContent();
      const price = await element.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).textContent();
      const description = await element.locator(SELECTORS.INVENTORY.PRODUCT_DESCRIPTION).textContent();

      initialProducts.push({ name, price, description });
    }

    // Sort by different options and verify data integrity
    const sortOptions = ['za', 'lohi', 'hilo', 'az'];

    for (const option of sortOptions) {
      await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, option);
      await page.waitForTimeout(500);

      const currentProducts = [];
      const currentElements = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).all();

      for (const element of currentElements) {
        const name = await element.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).textContent();
        const price = await element.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).textContent();
        const description = await element.locator(SELECTORS.INVENTORY.PRODUCT_DESCRIPTION).textContent();

        currentProducts.push({ name, price, description });
      }

      // Sort both arrays by name to compare
      const sortedInitial = [...initialProducts].sort((a, b) => a.name!.localeCompare(b.name!));
      const sortedCurrent = [...currentProducts].sort((a, b) => a.name!.localeCompare(b.name!));

      expect(sortedCurrent).toEqual(sortedInitial);
    }

    Logger.success('Product details integrity maintained during sorting');
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Sorting dropdown keyboard navigation`, async ({ page }) => {
    Logger.testStart('Testing sorting dropdown keyboard navigation');

    // Focus on dropdown
    await page.focus(SELECTORS.INVENTORY.SORT_DROPDOWN);

    // Use arrow keys to navigate options
    await page.press(SELECTORS.INVENTORY.SORT_DROPDOWN, 'ArrowDown');
    await page.press(SELECTORS.INVENTORY.SORT_DROPDOWN, 'Enter');

    // Verify selection changed
    const newValue = await page.locator(SELECTORS.INVENTORY.SORT_DROPDOWN).inputValue();
    expect(newValue).not.toBe('az');

    Logger.success('Sorting dropdown keyboard navigation working');
  });

});
