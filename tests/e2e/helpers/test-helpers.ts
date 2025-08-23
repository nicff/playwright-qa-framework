import { Page, BrowserContext, APIRequestContext, expect } from '@playwright/test';
import { Config } from '../../../utils/config';
import { SELECTORS, TIMEOUTS } from '../../../utils/constants';

/**
 * Comprehensive helper functions for E2E testing
 * Contains reusable functions for common test operations
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface TestUser {
  username: string;
  email: string;
  password: string;
  id?: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: string;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

// ============================================
// USER MANAGEMENT HELPERS
// ============================================

/**
 * Generate a unique test user with timestamp
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!'
  };
}

/**
 * Create and register a new test user
 * @param page - Playwright page object
 * @param userData - Optional user data, generates if not provided
 */
export async function createAndRegisterUser(page: Page, userData?: Partial<TestUser>): Promise<TestUser> {
  const user = { ...generateTestUser(), ...userData };
  
  console.log(`   📝 Creating user: ${user.email}`);
  
  // Navigate to registration page
  await page.goto(Config.getUrl('/register'));
  await page.waitForLoadState('domcontentloaded');
  
  // Fill registration form
  await page.fill(SELECTORS.AUTH.EMAIL_INPUT, user.email);
  await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, user.password);
  await page.fill(SELECTORS.AUTH.USERNAME_INPUT, user.username);
  
  // Submit registration
  await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
  
  // Wait for successful registration (redirect or success message)
  await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: TIMEOUTS.LONG });
  
  console.log(`   ✅ User registered successfully: ${user.email}`);
  return user;
}

/**
 * Login with existing user credentials
 * @param page - Playwright page object  
 * @param email - User email
 * @param password - User password
 */
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  console.log(`   🔐 Logging in user: ${email}`);
  
  await page.goto(Config.getUrl('/login'));
  await page.waitForLoadState('domcontentloaded');
  
  await page.fill(SELECTORS.AUTH.EMAIL_INPUT, email);
  await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, password);
  await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
  
  // Wait for successful login
  await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: TIMEOUTS.LONG });
  
  console.log(`   ✅ User logged in successfully`);
}

/**
 * Logout current user
 * @param page - Playwright page object
 */
export async function logoutUser(page: Page): Promise<void> {
  console.log(`   🚪 Logging out current user`);
  
  try {
    await page.click(SELECTORS.AUTH.LOGOUT_BUTTON, { timeout: TIMEOUTS.SHORT });
    await expect(page).toHaveURL(/\/(login|home)/, { timeout: TIMEOUTS.MEDIUM });
    console.log(`   ✅ User logged out successfully`);
  } catch (error) {
    console.log(`   ⚠️ Logout button not found or already logged out`);
  }
}

// ============================================
// NAVIGATION HELPERS
// ============================================

/**
 * Navigate to a specific page and wait for load
 * @param page - Playwright page object
 * @param path - Page path
 */
export async function navigateToPage(page: Page, path: string): Promise<void> {
  console.log(`   🧭 Navigating to: ${path}`);
  
  await page.goto(Config.getUrl(path));
  await page.waitForLoadState('domcontentloaded');
  
  console.log(`   ✅ Navigation completed`);
}

/**
 * Wait for page to be fully loaded with content
 * @param page - Playwright page object
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for common loading indicators to disappear
  try {
    await page.waitForSelector(SELECTORS.FORM.LOADING_SPINNER, { state: 'hidden', timeout: TIMEOUTS.SHORT });
  } catch {
    // Loading spinner might not exist, continue
  }
}

// ============================================
// ECOMMERCE HELPERS
// ============================================

/**
 * Generate sample product data
 */
export function generateSampleProduct(): Product {
  const timestamp = Date.now();
  return {
    id: timestamp,
    title: `Test Product ${timestamp}`,
    price: Math.floor(Math.random() * 100) + 10,
    description: 'This is a sample product for testing purposes.',
    category: 'Electronics',
    image: 'https://via.placeholder.com/300x200'
  };
}

/**
 * Add a product to cart
 * @param page - Playwright page object
 * @param productId - Product ID or selector
 */
export async function addProductToCart(page: Page, productId?: string): Promise<void> {
  console.log(`   🛒 Adding product to cart`);
  
  // If specific product ID provided, navigate to product page
  if (productId) {
    await navigateToPage(page, `/product/${productId}`);
  }
  
  // Click add to cart button
  await page.click(SELECTORS.ECOMMERCE.ADD_TO_CART_BUTTON);
  
  // Wait for cart update confirmation
  await expect(page.locator('.cart-count, .cart-badge')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  
  console.log(`   ✅ Product added to cart successfully`);
}

/**
 * Proceed to checkout and complete purchase
 * @param page - Playwright page object
 * @param paymentDetails - Optional payment information
 */
export async function proceedToCheckout(page: Page, paymentDetails?: PaymentData): Promise<string> {
  console.log(`   💳 Proceeding to checkout`);
  
  // Navigate to cart
  await page.click(SELECTORS.NAV.CART_LINK);
  await waitForPageLoad(page);
  
  // Proceed to checkout
  await page.click(SELECTORS.ECOMMERCE.CHECKOUT_BUTTON);
  await waitForPageLoad(page);
  
  // Fill payment details if provided (demo data)
  if (paymentDetails) {
    await fillPaymentForm(page, paymentDetails);
  } else {
    // Use default demo payment data
    await fillPaymentForm(page, {
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
      name: 'Test Customer'
    });
  }
  
  // Complete purchase
  await page.click('[data-testid="complete-purchase"], .complete-order-btn');
  
  // Wait for order confirmation
  await expect(page.locator('.order-success, .confirmation')).toBeVisible({ timeout: TIMEOUTS.LONG });
  
  // Extract order ID
  const orderText = await page.textContent('.order-number, .order-id');
  const orderId = orderText?.match(/\d+/)?.[0] || 'unknown';
  
  console.log(`   ✅ Checkout completed successfully. Order ID: ${orderId}`);
  return orderId;
}

/**
 * Fill payment form with demo data
 * @param page - Playwright page object
 * @param paymentData - Payment form data
 */
export async function fillPaymentForm(page: Page, paymentData: PaymentData): Promise<void> {
  console.log(`   💰 Filling payment form`);
  
  await page.fill('[data-testid="card-number"], input[name="cardNumber"]', paymentData.cardNumber);
  await page.fill('[data-testid="expiry-date"], input[name="expiryDate"]', paymentData.expiryDate);
  await page.fill('[data-testid="cvv"], input[name="cvv"]', paymentData.cvv);
  await page.fill('[data-testid="cardholder-name"], input[name="cardholderName"]', paymentData.name);
  
  console.log(`   ✅ Payment form filled`);
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Verify user is logged in
 * @param page - Playwright page object
 */
export async function verifyUserLoggedIn(page: Page): Promise<void> {
  // Check for logout button or user profile indicator
  await expect(page.locator(`${SELECTORS.AUTH.LOGOUT_BUTTON  }, .user-profile, .user-menu`)).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
}

/**
 * Verify form validation error
 * @param page - Playwright page object  
 * @param expectedMessage - Expected error message
 */
export async function verifyValidationError(page: Page, expectedMessage?: string): Promise<void> {
  const errorElement = page.locator(SELECTORS.FORM.INPUT_ERROR);
  await expect(errorElement).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  
  if (expectedMessage) {
    await expect(errorElement).toContainText(expectedMessage);
  }
}

/**
 * Verify success message is displayed
 * @param page - Playwright page object
 * @param expectedMessage - Expected success message
 */
export async function verifySuccessMessage(page: Page, expectedMessage?: string): Promise<void> {
  const successElement = page.locator(SELECTORS.FORM.SUCCESS_MESSAGE);
  await expect(successElement).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
  
  if (expectedMessage) {
    await expect(successElement).toContainText(expectedMessage);
  }
}

// ============================================
// API HELPERS
// ============================================

/**
 * Make authenticated API request
 * @param request - Playwright API request context
 * @param endpoint - API endpoint
 * @param options - Request options
 */
export async function makeAuthenticatedRequest(
  request: APIRequestContext,
  endpoint: string,
  options: Record<string, unknown> = {}
): Promise<unknown> {
  const url = Config.getApiUrl(endpoint);
  
  const response = await request.get(url, {
    headers: {
      'Authorization': `Bearer ${Config.API_CONFIG.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/**
 * Create test data via API
 * @param request - Playwright API request context
 * @param endpoint - API endpoint for data creation
 * @param data - Data to create
 */
export async function createTestDataViaAPI(
  request: APIRequestContext,
  endpoint: string,
  data: Record<string, unknown>
): Promise<unknown> {
  console.log(`   🔧 Creating test data via API: ${endpoint}`);
  
  const response = await request.post(Config.getApiUrl(endpoint), {
    headers: {
      'Authorization': `Bearer ${Config.API_CONFIG.token}`,
      'Content-Type': 'application/json'
    },
    data
  });
  
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  
  console.log(`   ✅ Test data created successfully`);
  return result;
}

// ============================================
// CLEANUP HELPERS
// ============================================

/**
 * Clean up test data and browser context
 * @param context - Browser context
 * @param page - Page object
 */
export async function cleanupTest(context: BrowserContext, page?: Page): Promise<void> {
  try {
    if (page) {
      await page.close({ runBeforeUnload: false });
    }
    await context.close();
  } catch (error) {
    console.log(`   ⚠️ Cleanup warning (non-critical): ${error}`);
  }
}

/**
 * Quick cleanup for multiple contexts
 * @param contexts - Array of browser contexts
 */
export async function quickCleanup(contexts: BrowserContext[]): Promise<void> {
  const closePromises = contexts.map(async (context) => {
    try {
      const pages = context.pages();
      await Promise.all(pages.map(page => page.close({ runBeforeUnload: false })));
      await context.close();
    } catch (error) {
      console.log(`   ⚠️ Cleanup warning (non-critical): ${error}`);
    }
  });
  
  await Promise.all(closePromises);
}

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Generate random test data
 */
export const TestDataGenerator = {
  randomEmail: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`,
  randomUsername: () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  randomPassword: () => `TestPass${Date.now()}!`,
  randomString: (length: number = 10) => Math.random().toString(36).substr(2, length),
  randomNumber: (min: number = 1, max: number = 100) => Math.floor(Math.random() * (max - min + 1)) + min
};

/**
 * Console logging helpers for clean test output
 */
export const Logger = {
  testStart: (testName: string) => console.log(`\n🎯 ${testName.toUpperCase()}\n${'='.repeat(50)}`),
  phase: (phase: number, description: string) => console.log(`\n📥 PHASE ${phase}: ${description}`),
  success: (message: string) => console.log(`   ✅ ${message}`),
  warning: (message: string) => console.log(`   ⚠️ ${message}`),
  error: (message: string) => console.log(`   ❌ ${message}`),
  info: (message: string) => console.log(`   ℹ️ ${message}`)
};