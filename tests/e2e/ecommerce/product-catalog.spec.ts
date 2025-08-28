import { test, expect } from '@playwright/test';
import { 
  Logger,
  loginSauceDemo,
  addProductToCart,
  getAllProducts,
  sortProducts,
  cleanupTest
} from '../helpers/test-helpers';
import { SELECTORS, TEST_TAGS } from '../../../utils/constants';

test.describe('Product Catalog Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginSauceDemo(page, 'STANDARD_USER');
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Product catalog displays correctly`, async ({ browser }) => {
    Logger.testStart('Product catalog display verification');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Verify product list is visible
      await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();

      // Get all products and verify they have required information
      const products = await getAllProducts(page);
      expect(products.length).toBeGreaterThan(0);

      // Verify each product has name, price, and description
      for (const product of products) {
        expect(product.name).toBeTruthy();
        expect(product.price).toBeTruthy();
        expect(product.description).toBeTruthy();
      }

      Logger.success(`Product catalog test completed - found ${products.length} products`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product sorting functionality`, async ({ browser }) => {
    Logger.testStart('Product sorting functionality');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Test different sorting options
      const sortOptions: Array<'az' | 'za' | 'lohi' | 'hilo'> = ['za', 'lohi', 'hilo', 'az'];

      for (const sortOption of sortOptions) {
        await sortProducts(page, sortOption);

        // Verify products are still visible after sorting
        await expect(page.locator(SELECTORS.INVENTORY.PRODUCT_LIST)).toBeVisible();
        const products = await getAllProducts(page);
        expect(products.length).toBeGreaterThan(0);
      }
      
      Logger.success('Product sorting test completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Add products to cart functionality`, async ({ browser }) => {
    Logger.testStart('Add products to cart functionality');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Add first product to cart
      const productName = await addProductToCart(page, 0);

      // Verify cart badge appears
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toBeVisible();
      await expect(page.locator(SELECTORS.NAV.CART_BADGE)).toHaveText('1');

      // Verify button changed to Remove
      await expect(page.locator(SELECTORS.INVENTORY.REMOVE_BUTTON).first()).toBeVisible();

      Logger.success(`Successfully added product to cart: ${productName}`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product images load correctly`, async ({ browser }) => {
    Logger.testStart('Product images loading verification');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      // Check that product images are present
      const productImages = page.locator(SELECTORS.INVENTORY.PRODUCT_IMAGE);
      const imageCount = await productImages.count();
      expect(imageCount).toBeGreaterThan(0);

      // Verify first few images have src attributes
      for (let i = 0; i < Math.min(3, imageCount); i++) {
        const imgSrc = await productImages.nth(i).getAttribute('src');
        expect(imgSrc).toBeTruthy();
      }
      
      Logger.success(`Product images verification completed - ${imageCount} images found`);
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product price format validation`, async ({ browser }) => {
    Logger.testStart('Product price format validation');

    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await loginSauceDemo(page, 'STANDARD_USER');

      const products = await getAllProducts(page);

      // Verify all prices are in correct format ($X.XX)
      for (const product of products) {
        expect(product.price).toMatch(/^\$\d+\.\d{2}$/);
      }
      
      Logger.success('Product price format validation completed successfully');
    } finally {
      await cleanupTest(context, page);
    }
  });

});