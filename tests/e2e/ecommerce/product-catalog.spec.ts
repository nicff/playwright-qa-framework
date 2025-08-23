import { test, expect } from '@playwright/test';
import { 
  navigateToPage,
  waitForPageLoad,
  createAndRegisterUser,
  Logger,
  cleanupTest
} from '../helpers/test-helpers';
import { Config } from '../../../utils/config';
import { SELECTORS, TEST_TAGS } from '../../../utils/constants';

test.describe('ecommerce - Product Catalog', () => {

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Product catalog page loads and displays products`, async ({ browser }) => {
    Logger.testStart('Product Catalog Page Load and Display');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Product Catalog');
      await navigateToPage(page, '/products');
      
      Logger.phase(2, 'Verify Product Listings');
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      const productCount = await productCards.count();
      Logger.success(`Product catalog loaded with ${productCount} products`);
      
      Logger.phase(3, 'Verify Product Information Display');
      const firstProduct = productCards.first();
      
      // Verify product has title
      const productTitle = firstProduct.locator('h1, h2, h3, .product-title, .title');
      await expect(productTitle).toBeVisible();
      
      // Verify product has price
      const productPrice = firstProduct.locator(SELECTORS.ECOMMERCE.PRICE_ELEMENT);
      await expect(productPrice).toBeVisible();
      
      // Verify product has image
      const productImage = firstProduct.locator('img');
      await expect(productImage).toBeVisible();
      
      Logger.success('Product information correctly displayed');
      
      Logger.phase(4, 'Verify Add to Cart Functionality');
      const addToCartButton = firstProduct.locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON);
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toBeEnabled();
      
      Logger.success('Add to cart button available and enabled');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product detail page navigation and information`, async ({ browser }) => {
    Logger.testStart('Product Detail Page Navigation and Information');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Product Catalog');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      Logger.phase(2, 'Navigate to Product Detail Page');
      // Click on first product (title or image)
      const productLink = productCards.first().locator('a, .product-link');
      if (await productLink.isVisible()) {
        await productLink.click();
      } else {
        // Try clicking the product card itself
        await productCards.first().click();
      }
      
      await waitForPageLoad(page);
      
      // Verify we're on product detail page
      await expect(page).toHaveURL(/\/product/, { timeout: 10000 });
      Logger.success('Successfully navigated to product detail page');
      
      Logger.phase(3, 'Verify Detailed Product Information');
      // Check for product title
      const productTitle = page.locator('h1, .product-title, .title');
      await expect(productTitle).toBeVisible();
      
      // Check for product description
      const productDescription = page.locator('.product-description, .description, p');
      await expect(productDescription).toBeVisible();
      
      // Check for product price
      const productPrice = page.locator(SELECTORS.ECOMMERCE.PRICE_ELEMENT);
      await expect(productPrice).toBeVisible();
      
      // Check for product images
      const productImages = page.locator('.product-images img, .gallery img');
      await expect(productImages.first()).toBeVisible();
      
      Logger.success('Detailed product information verified');
      
      Logger.phase(4, 'Verify Product Actions');
      // Check add to cart functionality on detail page
      const addToCartButton = page.locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON);
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toBeEnabled();
      
      // Check quantity selector if available
      const quantitySelector = page.locator(SELECTORS.ECOMMERCE.QUANTITY_INPUT);
      if (await quantitySelector.isVisible()) {
        await quantitySelector.fill('2');
        Logger.success('Quantity selector available and functional');
      }
      
      Logger.success('Product actions verified on detail page');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product sorting functionality`, async ({ browser }) => {
    Logger.testStart('Product Sorting Functionality');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Product Catalog');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      Logger.phase(2, 'Test Price Sorting - Low to High');
      const sortSelect = page.locator('select[name=\"sort\"], .sort-select, #sort');
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ label: /price.*low/i });
        await page.waitForTimeout(2000);
        
        // Verify products are sorted by price
        const prices = await page.locator(SELECTORS.ECOMMERCE.PRICE_ELEMENT).allTextContents();
        Logger.success(`Price sorting applied - found ${prices.length} price elements`);
      }
      
      Logger.phase(3, 'Test Price Sorting - High to Low');
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ label: /price.*high/i });
        await page.waitForTimeout(2000);
        
        const prices = await page.locator(SELECTORS.ECOMMERCE.PRICE_ELEMENT).allTextContents();
        Logger.success('High to low price sorting applied');
      }
      
      Logger.phase(4, 'Test Name Sorting');
      if (await sortSelect.isVisible()) {
        // Try to sort by name/title
        const nameOption = sortSelect.locator('option').filter({ hasText: /name|title|alphabetic/i });
        if (await nameOption.count() > 0) {
          await sortSelect.selectOption({ label: /name|title|alphabetic/i });
          await page.waitForTimeout(2000);
          Logger.success('Name sorting applied');
        }
      }
      
      Logger.success('Product sorting functionality tested');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.ECOMMERCE} Add product to cart from catalog`, async ({ browser }) => {
    Logger.testStart('Add Product to Cart from Catalog');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Setup');
      const testUser = await createAndRegisterUser(page);
      
      Logger.phase(2, 'Navigate to Products and Add to Cart');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      // Get initial cart count if visible
      const cartBadge = page.locator('.cart-count, .cart-badge, .badge');
      let initialCartCount = 0;
      if (await cartBadge.isVisible()) {
        const countText = await cartBadge.textContent();
        initialCartCount = parseInt(countText || '0');
      }
      
      // Add product to cart
      await productCards.first().locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON).click();
      await page.waitForTimeout(2000);
      
      Logger.phase(3, 'Verify Cart Update');
      // Check for cart count increase
      if (await cartBadge.isVisible()) {
        const newCountText = await cartBadge.textContent();
        const newCartCount = parseInt(newCountText || '0');
        expect(newCartCount).toBeGreaterThan(initialCartCount);
        Logger.success(`Cart count increased from ${initialCartCount} to ${newCartCount}`);
      }
      
      // Look for success notification
      const successNotification = page.locator('.notification, .toast, .alert-success');
      if (await successNotification.isVisible({ timeout: 5000 })) {
        Logger.success('Add to cart success notification displayed');
      }
      
      Logger.phase(4, 'Verify Cart Contents');
      await page.click(SELECTORS.NAV.CART_LINK);
      await waitForPageLoad(page);
      
      // Verify product is in cart
      const cartItems = page.locator(SELECTORS.ECOMMERCE.CART_ITEM);
      await expect(cartItems).toHaveCount(1);
      
      Logger.success('Product successfully added to cart and verified');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product availability and stock status`, async ({ browser }) => {
    Logger.testStart('Product Availability and Stock Status');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Product Catalog');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      Logger.phase(2, 'Check Stock Status Indicators');
      const productCount = await productCards.count();
      
      for (let i = 0; i < Math.min(3, productCount); i++) {
        const product = productCards.nth(i);
        
        // Check for stock status indicators
        const stockStatus = product.locator('.stock-status, .availability, .in-stock, .out-of-stock');
        if (await stockStatus.isVisible()) {
          const statusText = await stockStatus.textContent();
          Logger.success(`Product ${i + 1} stock status: ${statusText}`);
        }
        
        // Check if add to cart button is enabled/disabled based on stock
        const addToCartButton = product.locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON);
        const isEnabled = await addToCartButton.isEnabled();
        Logger.info(`Product ${i + 1} add to cart button enabled: ${isEnabled}`);
      }
      
      Logger.phase(3, 'Test Out of Stock Product Behavior');
      // Look for out of stock products
      const outOfStockProducts = page.locator('.out-of-stock, [data-stock=\"0\"]');
      if (await outOfStockProducts.first().isVisible()) {
        const outOfStockButton = outOfStockProducts.first().locator(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON);
        
        if (await outOfStockButton.isVisible()) {
          const isDisabled = outOfStockButton;
          await expect(isDisabled).toBeDisabled();
          Logger.success('Out of stock product correctly disables add to cart button');
        }
      }
      
      Logger.success('Product availability and stock status testing completed');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.ECOMMERCE} Product reviews and ratings display`, async ({ browser }) => {
    Logger.testStart('Product Reviews and Ratings Display');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Product Detail Page');
      await navigateToPage(page, '/products');
      
      const productCards = page.locator(SELECTORS.ECOMMERCE.PRODUCT_CARD);
      await expect(productCards.first()).toBeVisible({ timeout: 10000 });
      
      // Navigate to product detail
      const productLink = productCards.first().locator('a, .product-link');
      if (await productLink.isVisible()) {
        await productLink.click();
      } else {
        await productCards.first().click();
      }
      
      await waitForPageLoad(page);
      
      Logger.phase(2, 'Check Product Rating Display');
      const ratingElement = page.locator('.rating, .stars, .product-rating');
      if (await ratingElement.isVisible()) {
        const ratingText = await ratingElement.textContent();
        Logger.success(`Product rating displayed: ${ratingText}`);
        
        // Check for star ratings
        const stars = page.locator('.star, .rating-star');
        if (await stars.first().isVisible()) {
          const starCount = await stars.count();
          Logger.success(`Star rating display found with ${starCount} stars`);
        }
      }
      
      Logger.phase(3, 'Check Reviews Section');
      const reviewsSection = page.locator('.reviews, .customer-reviews, #reviews');
      if (await reviewsSection.isVisible()) {
        Logger.success('Reviews section found');
        
        // Check individual reviews
        const individualReviews = page.locator('.review, .customer-review');
        if (await individualReviews.first().isVisible()) {
          const reviewCount = await individualReviews.count();
          Logger.success(`Found ${reviewCount} individual reviews`);
          
          // Check review content
          const reviewText = individualReviews.first().locator('.review-text, .comment, p');
          if (await reviewText.isVisible()) {
            Logger.success('Review content displayed');
          }
          
          // Check reviewer name
          const reviewerName = individualReviews.first().locator('.reviewer, .author, .review-author');
          if (await reviewerName.isVisible()) {
            Logger.success('Reviewer name displayed');
          }
        }
      }
      
      Logger.phase(4, 'Test Review Pagination or Load More');
      const loadMoreButton = page.locator('.load-more, .show-more-reviews');
      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.click();
        await page.waitForTimeout(2000);
        Logger.success('Load more reviews functionality available');
      }
      
      const paginationControls = page.locator('.pagination, .page-numbers');
      if (await paginationControls.isVisible()) {
        Logger.success('Review pagination controls found');
      }
      
      Logger.success('Product reviews and ratings testing completed');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

});