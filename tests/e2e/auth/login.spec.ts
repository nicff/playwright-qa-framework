import { test, expect } from '@playwright/test';
import { 
  createAndRegisterUser, 
  loginUser, 
  logoutUser, 
  verifyUserLoggedIn, 
  verifyValidationError,
  TestDataGenerator,
  Logger,
  cleanupTest
} from '../helpers/test-helpers';
import { Config } from '../../../utils/config';
import { SELECTORS, TEST_TAGS } from '../../../utils/constants';

test.describe('user Authentication - Login Flow', () => {
  
  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Valid user login with email`, async ({ browser }) => {
    Logger.testStart('Valid User Login with Email');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Creation and Setup');
      const testUser = await createAndRegisterUser(page);
      await logoutUser(page);
      
      Logger.phase(2, 'Login Process');
      await loginUser(page, testUser.email, testUser.password);
      
      Logger.phase(3, 'Login Verification');
      await verifyUserLoggedIn(page);
      Logger.success('User successfully logged in with email');
      
      Logger.phase(4, 'Post-login Navigation Verification');
      await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: 10000 });
      Logger.success('User redirected to correct dashboard after login');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Valid user login with username`, async ({ browser }) => {
    Logger.testStart('Valid User Login with Username');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Creation and Setup');
      const testUser = await createAndRegisterUser(page);
      await logoutUser(page);
      
      Logger.phase(2, 'Login with Username');
      await page.goto(Config.getUrl('/login'));
      await page.waitForLoadState('networkidle');
      
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, testUser.username);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, testUser.password);
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      Logger.phase(3, 'Login Verification');
      await verifyUserLoggedIn(page);
      Logger.success('User successfully logged in with username');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Invalid login attempts - wrong password`, async ({ browser }) => {
    Logger.testStart('Invalid Login - Wrong Password');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Creation and Setup');
      const testUser = await createAndRegisterUser(page);
      await logoutUser(page);
      
      Logger.phase(2, 'Login with Wrong Password');
      await page.goto(Config.getUrl('/login'));
      await page.waitForLoadState('networkidle');
      
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, testUser.email);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'WrongPassword123!');
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      Logger.phase(3, 'Error Verification');
      await verifyValidationError(page);
      
      // Verify user is NOT logged in
      await expect(page.locator(SELECTORS.AUTH.LOGOUT_BUTTON)).not.toBeVisible({ timeout: 5000 });
      Logger.success('Login correctly rejected with wrong password');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Invalid login attempts - non-existent user`, async ({ browser }) => {
    Logger.testStart('Invalid Login - Non-existent User');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Login with Non-existent User');
      await page.goto(Config.getUrl('/login'));
      await page.waitForLoadState('networkidle');
      
      const fakeEmail = TestDataGenerator.randomEmail();
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, fakeEmail);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'SomePassword123!');
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      Logger.phase(2, 'Error Verification');
      await verifyValidationError(page);
      Logger.success('Login correctly rejected for non-existent user');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Login form validation - empty fields`, async ({ browser }) => {
    Logger.testStart('Login Form Validation - Empty Fields');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Login Form');
      await page.goto(Config.getUrl('/login'));
      await page.waitForLoadState('networkidle');
      
      Logger.phase(2, 'Submit Empty Form');
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      Logger.phase(3, 'Validation Error Verification');
      await verifyValidationError(page);
      
      // Verify login button is disabled or form shows validation errors
      const emailInput = page.locator(SELECTORS.AUTH.EMAIL_INPUT);
      const passwordInput = page.locator(SELECTORS.AUTH.PASSWORD_INPUT);
      
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
      
      Logger.success('Form validation working correctly for empty fields');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Remember me functionality`, async ({ browser }) => {
    Logger.testStart('Remember Me Functionality');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Creation and Setup');
      const testUser = await createAndRegisterUser(page);
      await logoutUser(page);
      
      Logger.phase(2, 'Login with Remember Me');
      await page.goto(Config.getUrl('/login'));
      await page.waitForLoadState('networkidle');
      
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, testUser.email);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, testUser.password);
      
      // Check remember me if available
      const rememberMeCheckbox = page.locator('input[type=\"checkbox\"][name*=\"remember\"], #remember-me');
      if (await rememberMeCheckbox.isVisible()) {
        await rememberMeCheckbox.check();
        Logger.info('Remember me checkbox checked');
      }
      
      await page.click(SELECTORS.AUTH.LOGIN_BUTTON);
      
      Logger.phase(3, 'Login Verification');
      await verifyUserLoggedIn(page);
      Logger.success('Login with remember me functionality completed');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Password visibility toggle`, async ({ browser }) => {
    Logger.testStart('Password Visibility Toggle');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Login Form');
      await page.goto(Config.getUrl('/login'));
      await page.waitForLoadState('networkidle');
      
      Logger.phase(2, 'Test Password Visibility Toggle');
      const passwordInput = page.locator(SELECTORS.AUTH.PASSWORD_INPUT);
      const toggleButton = page.locator('[data-testid=\"password-toggle\"], .password-toggle, button[aria-label*=\"password\"]');
      
      // Enter password
      await passwordInput.fill('TestPassword123!');
      
      // Verify password is hidden by default
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Toggle visibility if button exists
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        Logger.success('Password visibility toggle working correctly');
        
        // Toggle back to hidden
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
        Logger.success('Password hidden again successfully');
      } else {
        Logger.info('Password visibility toggle not implemented');
      }
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Logout functionality`, async ({ browser }) => {
    Logger.testStart('User Logout Functionality');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'User Login Setup');
      const _testUser = await createAndRegisterUser(page);
      await verifyUserLoggedIn(page);
      
      Logger.phase(2, 'Logout Process');
      await logoutUser(page);
      
      Logger.phase(3, 'Logout Verification');
      // Verify redirect to login page or home page
      await expect(page).toHaveURL(/\/(login|home|$)/, { timeout: 10000 });
      
      // Verify user is no longer logged in
      await expect(page.locator(SELECTORS.AUTH.LOGOUT_BUTTON)).not.toBeVisible({ timeout: 5000 });
      
      Logger.success('User successfully logged out');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

});