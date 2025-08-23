import { test, expect } from '@playwright/test';
import { 
  TestDataGenerator,
  verifyValidationError,
  verifySuccessMessage,
  verifyUserLoggedIn,
  Logger,
  cleanupTest
} from '../helpers/test-helpers';
import { Config } from '../../../utils/config';
import { SELECTORS, TEST_TAGS, VALIDATION_MESSAGES } from '../../../utils/constants';

test.describe('user Authentication - Registration Flow', () => {

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Valid user registration`, async ({ browser }) => {
    Logger.testStart('Valid User Registration');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Generate Test User Data');
      const userData = {
        username: TestDataGenerator.randomUsername(),
        email: TestDataGenerator.randomEmail(),
        password: TestDataGenerator.randomPassword()
      };
      Logger.info(`Test user: ${userData.email}`);
      
      Logger.phase(2, 'Navigate to Registration Form');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      Logger.phase(3, 'Fill Registration Form');
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, userData.email);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, userData.password);
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, userData.username);
      
      // Fill additional fields if they exist
      const firstNameInput = page.locator('input[name=\"firstName\"], input[name=\"first_name\"], #firstName');
      const lastNameInput = page.locator('input[name=\"lastName\"], input[name=\"last_name\"], #lastName');
      
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill('Test');
      }
      if (await lastNameInput.isVisible()) {
        await lastNameInput.fill('User');
      }
      
      Logger.phase(4, 'Submit Registration Form');
      await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
      
      Logger.phase(5, 'Verify Successful Registration');
      // Wait for either redirect to dashboard or success message
      await Promise.race([
        await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: 15000 }),
        verifySuccessMessage(page),
        verifyUserLoggedIn(page)
      ]);
      
      Logger.success('User registration completed successfully');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Registration validation - invalid email formats`, async ({ browser }) => {
    Logger.testStart('Registration Validation - Invalid Email Formats');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'test@',
      'test..test@example.com',
      'test space@example.com'
    ];
    
    try {
      Logger.phase(1, 'Navigate to Registration Form');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      for (let i = 0; i < invalidEmails.length; i++) {
        const invalidEmail = invalidEmails[i];
        Logger.phase(i + 2, `Testing Invalid Email: ${invalidEmail}`);
        
        // Clear and fill form
        await page.fill(SELECTORS.AUTH.EMAIL_INPUT, '');
        await page.fill(SELECTORS.AUTH.EMAIL_INPUT, invalidEmail);
        await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'ValidPassword123!');
        await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TestDataGenerator.randomUsername());
        
        // Submit form
        await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
        
        // Verify validation error
        await verifyValidationError(page);
        Logger.success(`Validation error correctly shown for: ${invalidEmail}`);
      }
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Registration validation - weak passwords`, async ({ browser }) => {
    Logger.testStart('Registration Validation - Weak Passwords');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const weakPasswords = [
      { password: '123', description: 'Too short' },
      { password: 'password', description: 'No numbers/symbols' },
      { password: '12345678', description: 'No letters' },
      { password: 'PASSWORD123', description: 'No lowercase' },
      { password: 'password123', description: 'No uppercase' }
    ];
    
    try {
      Logger.phase(1, 'Navigate to Registration Form');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      for (let i = 0; i < weakPasswords.length; i++) {
        const { password, description } = weakPasswords[i];
        Logger.phase(i + 2, `Testing Weak Password: ${description}`);
        
        // Fill form with weak password
        await page.fill(SELECTORS.AUTH.EMAIL_INPUT, TestDataGenerator.randomEmail());
        await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, password);
        await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TestDataGenerator.randomUsername());
        
        // Submit form
        await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
        
        // Verify validation error
        await verifyValidationError(page);
        Logger.success(`Validation error correctly shown for weak password: ${description}`);
        
        // Clear fields for next iteration
        await page.fill(SELECTORS.AUTH.EMAIL_INPUT, '');
        await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, '');
        await page.fill(SELECTORS.AUTH.USERNAME_INPUT, '');
      }
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Registration validation - duplicate email`, async ({ browser }) => {
    Logger.testStart('Registration Validation - Duplicate Email');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Register First User');
      const userData = {
        username: TestDataGenerator.randomUsername(),
        email: TestDataGenerator.randomEmail(),
        password: TestDataGenerator.randomPassword()
      };
      
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, userData.email);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, userData.password);
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, userData.username);
      await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
      
      // Wait for successful registration
      await Promise.race([
        await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: 15000 }),
        verifyUserLoggedIn(page)
      ]);
      
      Logger.success('First user registered successfully');
      
      Logger.phase(2, 'Attempt to Register with Same Email');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      // Try to register with same email
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, userData.email);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'DifferentPassword123!');
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TestDataGenerator.randomUsername());
      await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
      
      Logger.phase(3, 'Verify Duplicate Email Error');
      await verifyValidationError(page);
      Logger.success('Duplicate email correctly rejected');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Registration validation - duplicate username`, async ({ browser }) => {
    Logger.testStart('Registration Validation - Duplicate Username');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Register First User');
      const userData = {
        username: TestDataGenerator.randomUsername(),
        email: TestDataGenerator.randomEmail(),
        password: TestDataGenerator.randomPassword()
      };
      
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, userData.email);
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, userData.password);
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, userData.username);
      await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
      
      // Wait for successful registration
      await Promise.race([
        await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: 15000 }),
        verifyUserLoggedIn(page)
      ]);
      
      Logger.success('First user registered successfully');
      
      Logger.phase(2, 'Attempt to Register with Same Username');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      // Try to register with same username
      await page.fill(SELECTORS.AUTH.EMAIL_INPUT, TestDataGenerator.randomEmail());
      await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'DifferentPassword123!');
      await page.fill(SELECTORS.AUTH.USERNAME_INPUT, userData.username);
      await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
      
      Logger.phase(3, 'Verify Duplicate Username Error');
      await verifyValidationError(page);
      Logger.success('Duplicate username correctly rejected');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Registration form validation - required fields`, async ({ browser }) => {
    Logger.testStart('Registration Form Validation - Required Fields');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Registration Form');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      Logger.phase(2, 'Submit Empty Form');
      await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
      
      Logger.phase(3, 'Verify Required Field Validation');
      await verifyValidationError(page);
      
      // Verify required attributes on inputs
      const emailInput = page.locator(SELECTORS.AUTH.EMAIL_INPUT);
      const passwordInput = page.locator(SELECTORS.AUTH.PASSWORD_INPUT);
      const usernameInput = page.locator(SELECTORS.AUTH.USERNAME_INPUT);
      
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
      await expect(usernameInput).toHaveAttribute('required');
      
      Logger.success('Required field validation working correctly');
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Password confirmation matching`, async ({ browser }) => {
    Logger.testStart('Password Confirmation Matching');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Registration Form');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      const passwordConfirmInput = page.locator('input[name=\"passwordConfirm\"], input[name=\"confirmPassword\"], #passwordConfirm');
      
      if (await passwordConfirmInput.isVisible()) {
        Logger.phase(2, 'Test Non-matching Passwords');
        await page.fill(SELECTORS.AUTH.EMAIL_INPUT, TestDataGenerator.randomEmail());
        await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, 'Password123!');
        await passwordConfirmInput.fill('DifferentPassword123!');
        await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TestDataGenerator.randomUsername());
        
        await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
        
        Logger.phase(3, 'Verify Password Mismatch Error');
        await verifyValidationError(page);
        Logger.success('Password mismatch correctly detected');
        
        Logger.phase(4, 'Test Matching Passwords');
        const password = 'MatchingPassword123!';
        await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, password);
        await passwordConfirmInput.fill(password);
        
        await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
        
        // Should proceed without password mismatch error
        await Promise.race([
          await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: 15000 }),
          verifyUserLoggedIn(page)
        ]);
        
        Logger.success('Matching passwords accepted successfully');
      } else {
        Logger.info('Password confirmation field not implemented');
      }
      
    } finally {
      await cleanupTest(context, page);
    }
  });

  test(`${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} Terms and conditions acceptance`, async ({ browser }) => {
    Logger.testStart('Terms and Conditions Acceptance');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      Logger.phase(1, 'Navigate to Registration Form');
      await page.goto(Config.getUrl('/register'));
      await page.waitForLoadState('networkidle');
      
      const termsCheckbox = page.locator('input[type=\"checkbox\"][name*=\"terms\"], input[type=\"checkbox\"][name*=\"agree\"], #terms');
      
      if (await termsCheckbox.isVisible()) {
        Logger.phase(2, 'Attempt Registration Without Accepting Terms');
        await page.fill(SELECTORS.AUTH.EMAIL_INPUT, TestDataGenerator.randomEmail());
        await page.fill(SELECTORS.AUTH.PASSWORD_INPUT, TestDataGenerator.randomPassword());
        await page.fill(SELECTORS.AUTH.USERNAME_INPUT, TestDataGenerator.randomUsername());
        
        // Ensure terms checkbox is unchecked
        await termsCheckbox.uncheck();
        await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
        
        Logger.phase(3, 'Verify Terms Acceptance Required');
        await verifyValidationError(page);
        Logger.success('Terms acceptance requirement working correctly');
        
        Logger.phase(4, 'Accept Terms and Complete Registration');
        await termsCheckbox.check();
        await page.click(SELECTORS.AUTH.REGISTER_BUTTON);
        
        await Promise.race([
          await expect(page).toHaveURL(/\/(dashboard|profile|home)/, { timeout: 15000 }),
          verifyUserLoggedIn(page)
        ]);
        
        Logger.success('Registration completed after accepting terms');
      } else {
        Logger.info('Terms and conditions checkbox not implemented');
      }
      
    } finally {
      await cleanupTest(context, page);
    }
  });

});