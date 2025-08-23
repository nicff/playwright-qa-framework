/**
 * Constants for the QE Automation Framework
 * Contains all static values used across the test suite
 */

// Test timeouts (in milliseconds)
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  EXTRA_LONG: 60000,
  TEST_TIMEOUT: 120000
} as const;

// Test tags for filtering and categorization
export const TEST_TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression', 
  CRITICAL: '@critical',
  SANITY: '@sanity',
  API: '@api',
  E2E: '@e2e',
  AUTH: '@auth',
  ECOMMERCE: '@ecommerce',
  PAYMENT: '@payment',
  MOBILE: '@mobile'
} as const;

// Selector patterns for common UI elements
export const SELECTORS = {
  // Authentication elements
  AUTH: {
    EMAIL_INPUT: '[data-testid="email-input"], #email, input[type="email"]',
    PASSWORD_INPUT: '[data-testid="password-input"], #password, input[type="password"]',
    USERNAME_INPUT: '[data-testid="username-input"], #username',
    LOGIN_BUTTON: '[data-testid="login-button"], button[type="submit"], .login-btn',
    REGISTER_BUTTON: '[data-testid="register-button"], .register-btn',
    LOGOUT_BUTTON: '[data-testid="logout-button"], .logout-btn',
    FORGOT_PASSWORD_LINK: '[data-testid="forgot-password"], .forgot-password'
  },
  
  // Navigation elements
  NAV: {
    HOME_LINK: '[data-testid="home-link"], .nav-home',
    PROFILE_LINK: '[data-testid="profile-link"], .nav-profile',
    CART_LINK: '[data-testid="cart-link"], .nav-cart',
    MENU_TOGGLE: '[data-testid="menu-toggle"], .menu-toggle'
  },
  
  // Ecommerce elements
  ECOMMERCE: {
    PRODUCT_CARD: '[data-testid="product-card"], .product-item',
    ADD_TO_CART_BUTTON: '[data-testid="add-to-cart"], .add-to-cart-btn',
    CART_ITEM: '[data-testid="cart-item"], .cart-item',
    CHECKOUT_BUTTON: '[data-testid="checkout-button"], .checkout-btn',
    PRICE_ELEMENT: '[data-testid="price"], .price',
    QUANTITY_INPUT: '[data-testid="quantity"], input[name="quantity"]'
  },
  
  // Form elements
  FORM: {
    SUBMIT_BUTTON: 'button[type="submit"], .submit-btn',
    CANCEL_BUTTON: '[data-testid="cancel"], .cancel-btn',
    INPUT_ERROR: '.error-message, .field-error',
    SUCCESS_MESSAGE: '.success-message, .alert-success',
    LOADING_SPINNER: '.loading, .spinner, [data-testid="loading"]'
  },
  
  // Modal and overlay elements
  MODAL: {
    CONTAINER: '.modal, [role="dialog"]',
    CLOSE_BUTTON: '.modal-close, [data-testid="modal-close"]',
    CONFIRM_BUTTON: '.modal-confirm, [data-testid="confirm"]',
    OVERLAY: '.modal-overlay, .backdrop'
  }
} as const;

// Test data patterns
export const TEST_DATA = {
  // Valid email patterns for testing
  VALID_EMAILS: [
    'testuser@example.com',
    'qa.engineer@testdomain.com', 
    'automation.test@demo.com'
  ],
  
  // Invalid email patterns for negative testing
  INVALID_EMAILS: [
    'invalid-email',
    '@example.com',
    'test@',
    'test..test@example.com'
  ],
  
  // Password patterns
  VALID_PASSWORDS: [
    'StrongPassword123!',
    'TestPass456$',
    'QAPassword789#'
  ],
  
  INVALID_PASSWORDS: [
    '123',         // Too short
    'password',    // No numbers/symbols
    '12345678',    // No letters
    'PASSWORD123'  // No lowercase
  ],
  
  // Common test strings
  STRINGS: {
    LOREM_IPSUM: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    TEST_DESCRIPTION: 'This is a test description for automation testing purposes.',
    SAMPLE_ADDRESS: '123 Test Street, QA City, TC 12345',
    SAMPLE_PHONE: '+1-555-TEST-QA'
  }
} as const;

// API endpoints for testing
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password'
  },
  
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/delete-account'
  },
  
  PRODUCTS: {
    LIST: '/products',
    DETAILS: '/products/:id',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    SEARCH: '/products/search'
  },
  
  ORDERS: {
    LIST: '/orders',
    DETAILS: '/orders/:id',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    CANCEL: '/orders/:id/cancel'
  },
  
  CART: {
    VIEW: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: '/cart/items/:id',
    REMOVE_ITEM: '/cart/items/:id',
    CLEAR: '/cart/clear'
  }
} as const;

// HTTP status codes for API testing
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Browser and device configurations
export const DEVICES = {
  DESKTOP: {
    CHROME: 'Desktop Chrome',
    FIREFOX: 'Desktop Firefox',
    SAFARI: 'Desktop Safari'
  },
  
  MOBILE: {
    IPHONE: 'iPhone 12',
    PIXEL: 'Pixel 5',
    SAMSUNG: 'Galaxy S5'
  },
  
  TABLET: {
    IPAD: 'iPad',
    SURFACE: 'Microsoft Surface Pro 7'
  }
} as const;

// Test environment URLs (all demo/mock)
export const ENVIRONMENTS = {
  LOCAL: 'http://localhost:3000',
  STAGING: 'https://staging.demo-app.example.com',
  PRODUCTION: 'https://demo-app.example.com'
} as const;

// Test user roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
  MODERATOR: 'moderator'
} as const;

// Common validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  USERNAME_TAKEN: 'Username is already taken',
  EMAIL_TAKEN: 'Email is already registered'
} as const;