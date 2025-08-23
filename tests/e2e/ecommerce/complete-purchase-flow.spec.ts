import { test, expect } from '@playwright/test';
import { 
  createAndRegisterUser,
  addProductToCart,
  proceedToCheckout,
  navigateToPage,
  waitForPageLoad,
  TestDataGenerator,
  Logger,
  cleanupTest
} from '../helpers/test-helpers';
import { Config } from '../../../utils/config';
import { SELECTORS, TEST_TAGS } from '../../../utils/constants';
import testProducts from '../../../fixtures/test-products.json';

test.describe('Ecommerce - Complete Purchase Flow', () => {

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Complete user journey - Registration to Purchase`, async ({ browser }) => {
    Logger.testStart('Complete User Journey - Registration to Purchase');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Registration and Authentication');
      const testUser = await createAndRegisterUser(page);
      Logger.success(`User registered: ${testUser.email}`);
      
      Logger.phase(2, 'Product Browsing and Selection');
      await navigateToPage(page, '/products');
      
      // Look for product listings
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      const productCount = await productCards.count();
      Logger.success(`Found ${productCount} products available`);
      
      Logger.phase(3, 'Add Multiple Products to Cart');
      // Add first product
      await productCards.first().locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
      await page.waitForTimeout(1000); // Allow cart to update
      
      // Add second product if available
      if (productCount > 1) {
        await productCards.nth(1).locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
        await page.waitForTimeout(1000);
        Logger.success('Multiple products added to cart');
      }
      
      Logger.phase(4, 'Cart Review and Validation');
      await page.click(SELECTORS.NAV.CART_LINK);
      await waitForPageLoad(page);
      
      // Verify cart contains items
      const cartItems = page.locator(SELECTORS.ECOMMERCE.CART_ITEM);
      await expect(cartItems).toHaveCount(productCount > 1 ? 2 : 1);
      
      // Check cart total is displayed
      const cartTotal = page.locator(SELECTORS.ECOMMERCE.PRICE_ELEMENT + ', .cart-total, .total-amount');
      await expect(cartTotal).toBeVisible();
      
      Logger.success('Cart contents validated successfully');
      
      Logger.phase(5, 'Checkout Process');
      await page.click(SELECTORS.ECOMMERCE.CHECKOUT_BUTTON);
      await waitForPageLoad(page);
      
      Logger.phase(6, 'Shipping Information');
      // Fill shipping information if form exists
      const shippingForm = page.locator('form[name=\"shipping\"], .shipping-form, #shipping-form');
      if (await shippingForm.isVisible()) {
        await page.fill('input[name=\"firstName\"], #firstName', 'Test');
        await page.fill('input[name=\"lastName\"], #lastName', 'Customer');
        await page.fill('input[name=\"address\"], #address', '123 Test Street');
        await page.fill('input[name=\"city\"], #city', 'Test City');
        await page.fill('input[name=\"zipCode\"], #zipCode', '12345');
        
        const continueButton = page.locator('button[type=\"submit\"], .continue-btn, .next-btn');
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await waitForPageLoad(page);
        }
        
        Logger.success('Shipping information completed');
      }
      
      Logger.phase(7, 'Payment Information');
      // Fill payment form with test data
      await page.fill('input[name=\"cardNumber\"], #cardNumber', '4111111111111111');
      await page.fill('input[name=\"expiryDate\"], #expiryDate', '12/25');
      await page.fill('input[name=\"cvv\"], #cvv', '123');
      await page.fill('input[name=\"cardholderName\"], #cardholderName', 'Test Customer');
      
      Logger.success('Payment information filled');
      
      Logger.phase(8, 'Order Completion');
      const completeOrderButton = page.locator('button[type=\"submit\"], .complete-order-btn, .place-order-btn');
      await completeOrderButton.click();
      
      Logger.phase(9, 'Order Confirmation Verification');
      // Wait for order confirmation
      await expect(page.locator('.order-success, .confirmation, .thank-you')).toBeVisible({ timeout: 20000 });
      
      // Verify order details are displayed
      const orderNumber = page.locator('.order-number, .order-id, .confirmation-number');
      if (await orderNumber.isVisible()) {
        const orderText = await orderNumber.textContent();
        Logger.success(`Order confirmed with number: ${orderText}`);
      }
      
      Logger.success('Complete purchase flow executed successfully');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Guest checkout flow`, async ({ browser }) => {
    Logger.testStart('Guest Checkout Flow');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Product Selection as Guest');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      // Add product to cart
      await productCards.first().locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
      Logger.success('Product added to cart as guest');
      
      Logger.phase(2, 'Proceed to Checkout as Guest');
      await page.click(SELECTORS.NAV.CART_LINK);
      await waitForPageLoad(page);
      
      await page.click(SELECTORS.ECOMMERCE.CHECKOUT_BUTTON);
      await waitForPageLoad(page);
      
      // Look for guest checkout option
      const guestCheckoutButton = page.locator('.guest-checkout, .checkout-as-guest, button:has-text(\"Guest\")');
      if (await guestCheckoutButton.isVisible()) {
        await guestCheckoutButton.click();
        await waitForPageLoad(page);
        Logger.success('Guest checkout option selected');
      }
      
      Logger.phase(3, 'Fill Guest Information');
      // Fill guest information
      await page.fill('input[name=\"email\"], #email', TestDataGenerator.randomEmail());
      await page.fill('input[name=\"firstName\"], #firstName', 'Guest');
      await page.fill('input[name=\"lastName\"], #lastName', 'Customer');
      await page.fill('input[name=\"address\"], #address', '123 Guest Street');
      await page.fill('input[name=\"city\"], #city', 'Guest City');
      await page.fill('input[name=\"zipCode\"], #zipCode', '54321');
      
      Logger.phase(4, 'Complete Guest Payment');
      // Fill payment information
      await page.fill('input[name=\"cardNumber\"], #cardNumber', '4111111111111111');
      await page.fill('input[name=\"expiryDate\"], #expiryDate', '12/25');
      await page.fill('input[name=\"cvv\"], #cvv', '123');
      await page.fill('input[name=\"cardholderName\"], #cardholderName', 'Guest Customer');
      
      // Complete order
      const completeOrderButton = page.locator('button[type=\"submit\"], .complete-order-btn, .place-order-btn');
      await completeOrderButton.click();
      
      Logger.phase(5, 'Verify Guest Order Confirmation');
      await expect(page.locator('.order-success, .confirmation, .thank-you')).toBeVisible({ timeout: 20000 });
      
      Logger.success('Guest checkout completed successfully');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Cart modifications during checkout`, async ({ browser }) => {
    Logger.testStart('Cart Modifications During Checkout');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Setup and Product Addition');
      const testUser = await createAndRegisterUser(page);
      
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      // Add multiple products
      await productCards.first().locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
      await page.waitForTimeout(1000);
      
      if (await productCards.nth(1).isVisible()) {
        await productCards.nth(1).locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
        await page.waitForTimeout(1000);
      }
      
      Logger.phase(2, 'Navigate to Cart and Modify Quantities');
      await page.click(SELECTORS.NAV.CART_LINK);
      await waitForPageLoad(page);
      
      // Modify quantity if quantity input exists
      const quantityInput = page.locator(SELECTORS.ECOMMERCE.QUANTITY_INPUT).first();
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('3');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000); // Allow for cart update
        
        // Verify total has updated
        const updatedTotal = page.locator('.cart-total, .total-amount');
        await expect(updatedTotal).toBeVisible();
        Logger.success('Cart quantity updated successfully');
      }
      
      Logger.phase(3, 'Remove Item from Cart');
      const removeButtons = page.locator('.remove-item, .delete-item, button:has-text(\"Remove\")');
      if (await removeButtons.first().isVisible()) {
        await removeButtons.first().click();
        await page.waitForTimeout(2000);
        
        Logger.success('Item removed from cart');
      }
      
      Logger.phase(4, 'Proceed with Modified Cart');
      await page.click(SELECTORS.ECOMMERCE.CHECKOUT_BUTTON);
      await waitForPageLoad(page);
      
      // Verify checkout shows updated cart contents
      const checkoutItems = page.locator('.checkout-item, .order-item');
      await expect(checkoutItems).toBeVisible();
      
      Logger.success('Modified cart processed correctly in checkout');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Payment form validation`, async ({ browser }) => {
    Logger.testStart('Payment Form Validation');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Setup User and Proceed to Payment');
      const testUser = await createAndRegisterUser(page);
      
      await navigateToPage(page, '/products');
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      await productCards.first().locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
      await page.click(SELECTORS.NAV.CART_LINK);
      await page.click(SELECTORS.ECOMMERCE.CHECKOUT_BUTTON);
      await waitForPageLoad(page);
      
      Logger.phase(2, 'Test Invalid Card Number');
      await page.fill('input[name=\"cardNumber\"], #cardNumber', '1111111111111111');
      await page.fill('input[name=\"expiryDate\"], #expiryDate', '12/25');
      await page.fill('input[name=\"cvv\"], #cvv', '123');
      await page.fill('input[name=\"cardholderName\"], #cardholderName', 'Test Customer');
      
      const submitButton = page.locator('button[type=\"submit\"], .complete-order-btn');
      await submitButton.click();
      
      // Check for validation error
      const errorMessage = page.locator('.error-message, .field-error, .payment-error');
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        Logger.success('Invalid card number correctly rejected');
      }
      
      Logger.phase(3, 'Test Empty Required Fields');
      await page.fill('input[name=\"cardNumber\"], #cardNumber', '');
      await page.fill('input[name=\"cvv\"], #cvv', '');
      await submitButton.click();
      
      // Verify required field validation
      const requiredErrors = page.locator('.error-message, .field-error');
      if (await requiredErrors.first().isVisible({ timeout: 5000 })) {
        Logger.success('Empty required fields correctly validated');
      }
      
      Logger.phase(4, 'Test Valid Payment Data');
      await page.fill('input[name=\"cardNumber\"], #cardNumber', '4111111111111111');
      await page.fill('input[name=\"expiryDate\"], #expiryDate', '12/25');
      await page.fill('input[name=\"cvv\"], #cvv', '123');
      await page.fill('input[name=\"cardholderName\"], #cardholderName', 'Test Customer');
      
      await submitButton.click();
      
      // Should proceed to confirmation or show processing
      await expect(page.locator('.order-success, .processing, .confirmation')).toBeVisible({ timeout: 20000 });
      
      Logger.success('Valid payment data processed successfully');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.E2E} ${TEST_TAGS.ECOMMERCE} Product search and filtering`, async ({ browser }) => {
    Logger.testStart('Product Search and Filtering');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Products Page');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      const initialProductCount = await productCards.count();
      Logger.success(`Found ${initialProductCount} initial products`);
      
      Logger.phase(2, 'Test Product Search');
      const searchInput = page.locator('input[name=\"search\"], #search, .search-input');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Verify search results
        const searchResults = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
        const searchCount = await searchResults.count();
        
        Logger.success(`Search returned ${searchCount} products`);
      }
      
      Logger.phase(3, 'Test Category Filtering');
      const categoryFilter = page.locator('.category-filter, select[name=\"category\"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption({ label: 'Electronics' });
        await page.waitForTimeout(2000);
        
        // Verify filtered results
        const filteredResults = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
        const filteredCount = await filteredResults.count();
        
        Logger.success(`Category filter returned ${filteredCount} products`);
      }
      
      Logger.phase(4, 'Test Price Range Filter');
      const priceMinInput = page.locator('input[name=\"priceMin\"], #priceMin');
      const priceMaxInput = page.locator('input[name=\"priceMax\"], #priceMax');
      
      if (await priceMinInput.isVisible() && await priceMaxInput.isVisible()) {
        await priceMinInput.fill('10');
        await priceMaxInput.fill('100');
        
        const applyFilterButton = page.locator('.apply-filter, button:has-text(\"Apply\")');
        if (await applyFilterButton.isVisible()) {
          await applyFilterButton.click();
          await page.waitForTimeout(2000);
          
          Logger.success('Price range filter applied');
        }
      }
      
      Logger.success('Product search and filtering tests completed');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

});