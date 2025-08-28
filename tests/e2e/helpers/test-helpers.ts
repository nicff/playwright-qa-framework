import { Page, BrowserContext } from '@playwright/test';
import { SELECTORS, TIMEOUTS, TEST_DATA, ENVIRONMENTS } from '@utils/constants';

/**
 * SauceDemo-specific helper functions for E2E testing
 * Contains reusable functions optimized for SauceDemo application
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface SauceDemoProduct {
  name: string;
  price: string;
  description: string;
}

// ============================================
// UTILITY HELPERS (Must be declared first)
// ============================================

/**
 * Simple logger for test steps
 */
export class Logger {
  static info(message: string): void {
    console.log(`   ℹ️  ${message}`);
  }

  static success(message: string): void {
    console.log(`   ✅ ${message}`);
  }

  static error(message: string): void {
    console.log(`   ❌ ${message}`);
  }

  static testStart(testName: string): void {
    console.log(`\n🧪 TEST START: ${testName}`);
  }

  static phase(phaseNumber: number, description: string): void {
    console.log(`\n📋 PHASE ${phaseNumber}: ${description}`);
  }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

/**
 * Login to SauceDemo with specified user
 * @param page - Playwright page object
 * @param userType - Type of SauceDemo user to login with
 */
export async function loginSauceDemo(page: Page, userType: keyof typeof TEST_DATA.SAUCEDEMO_USERS = 'STANDARD_USER'): Promise<void> {
  const user = TEST_DATA.SAUCEDEMO_USERS[userType];

  Logger.info(`🔐 Logging in as: ${user.username}`);

  await page.goto(ENVIRONMENTS.PRODUCTION);
  await page.fill(SELECTORS.AUTH.USERNAME_INPUT, user.username);
  await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, user.password);
  await page.click(SELECTORS.AUTH.LOGIN_BUTTON);

  // Wait for inventory page (successful login)
  await page.waitForSelector(SELECTORS.INVENTORY.PRODUCT_LIST, { timeout: TIMEOUTS.MEDIUM });

  Logger.success(`✅ Successfully logged in as ${user.username}`);
}

/**
 * Logout from SauceDemo
 * @param page - Playwright page object
 */
export async function logoutSauceDemo(page: Page): Promise<void> {
  Logger.info(`🚪 Logging out from SauceDemo`);

  await page.click(SELECTORS.NAV.MENU_BUTTON);
  await page.click(SELECTORS.NAV.LOGOUT_LINK);

  // Wait for login page
  await page.waitForSelector(SELECTORS.AUTH.LOGIN_BUTTON, { timeout: TIMEOUTS.MEDIUM });

  Logger.success(`✅ Successfully logged out`);
}

// ============================================
// PRODUCT & INVENTORY HELPERS
// ============================================

/**
 * Get all available products from inventory page
 * @param page - Playwright page object
 * @returns Array of product information
 */
export async function getAllProducts(page: Page): Promise<SauceDemoProduct[]> {
  const products: SauceDemoProduct[] = [];

  const productElements = await page.locator(SELECTORS.INVENTORY.PRODUCT_ITEM).all();

  for (const element of productElements) {
    const name = await element.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).textContent() || '';
    const price = await element.locator(SELECTORS.INVENTORY.PRODUCT_PRICE).textContent() || '';
    const description = await element.locator(SELECTORS.INVENTORY.PRODUCT_DESCRIPTION).textContent() || '';

    products.push({ name, price, description });
  }

  Logger.info(`📦 Found ${products.length} products in inventory`);
  return products;
}

/**
 * Add specific product to cart by index
 * @param page - Playwright page object
 * @param productIndex - Index of product to add (0-based)
 */
export async function addProductToCart(page: Page, productIndex: number = 0): Promise<string> {
  const productName = await page.locator(SELECTORS.INVENTORY.PRODUCT_TITLE).nth(productIndex).textContent();

  Logger.info(`🛒 Adding product to cart: ${productName}`);

  await page.locator(SELECTORS.INVENTORY.ADD_TO_CART_BUTTON).nth(productIndex).click();

  Logger.success(`✅ Product added to cart: ${productName}`);
  return productName || '';
}

/**
 * Sort products by specified option
 * @param page - Playwright page object
 * @param sortOption - Sort option ('az', 'za', 'lohi', 'hilo')
 */
export async function sortProducts(page: Page, sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
  Logger.info(`📊 Sorting products by: ${sortOption}`);

  await page.selectOption(SELECTORS.INVENTORY.SORT_DROPDOWN, sortOption);
  await page.waitForTimeout(500); // Wait for sorting to complete

  Logger.success(`✅ Products sorted by ${sortOption}`);
}

// ============================================
// NAVIGATION HELPERS
// ============================================

/**
 * Wait for page to be fully loaded
 * @param page - Playwright page object
 * @param timeout - Timeout in milliseconds (default: MEDIUM timeout)
 */
export async function waitForPageLoad(page: Page, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Test cleanup helper
 * @param context - Browser context
 * @param page - Page object
 */
export async function cleanupTest(context: BrowserContext, page: Page): Promise<void> {
  try {
    if (page) {
      await page.close();
    }
    await context.close();
  } catch (error) {
    console.log('   ⚠️ Cleanup warning:', error);
  }
}
