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
  SMOKE: '[smoke]',
  REGRESSION: '[regression]', 
  CRITICAL: '[critical]',
  SANITY: '[sanity]',
  API: '[api]',
  E2E: '[e2e]',
  AUTH: '[auth]',
  ECOMMERCE: '[ecommerce]',
  PAYMENT: '[payment]',
  MOBILE: '[mobile]'
} as const;

// Selector patterns for common UI elements
export const SELECTORS = {
  // SauceDemo Authentication elements (real selectors)
  AUTH: {
    USERNAME_INPUT: 'input[data-test="username"]',
    PASSWORD_INPUT: 'input[data-test="password"]',
    LOGIN_BUTTON: 'input[data-test="login-button"]',
    ERROR_MESSAGE: '[data-test="error"]',
    ERROR_CONTAINER: '.error-message-container'
  },
  
  // SauceDemo Navigation elements (real selectors)
  NAV: {
    MENU_BUTTON: '#react-burger-menu-btn',
    CART_LINK: '.shopping_cart_link',
    CART_BADGE: '.shopping_cart_badge',
    LOGOUT_LINK: '#logout_sidebar_link',
    ALL_ITEMS_LINK: '#inventory_sidebar_link',
    ABOUT_LINK: '#about_sidebar_link',
    RESET_APP_LINK: '#reset_sidebar_link'
  },

  // SauceDemo Inventory/Products elements (real selectors)
  INVENTORY: {
    PRODUCT_LIST: '.inventory_list',
    PRODUCT_ITEM: '.inventory_item',
    PRODUCT_TITLE: '.inventory_item_name',
    PRODUCT_DESCRIPTION: '.inventory_item_desc',
    PRODUCT_PRICE: '.inventory_item_price',
    PRODUCT_IMAGE: '.inventory_item_img',
    ADD_TO_CART_BUTTON: '[data-test*="add-to-cart"]',
    REMOVE_BUTTON: '[data-test*="remove"]',
    SORT_DROPDOWN: '.product_sort_container'
  },

  // SauceDemo Cart elements (real selectors)
  CART: {
    CART_LIST: '.cart_list',
    CART_ITEM: '.cart_item',
    CART_ITEM_NAME: '.inventory_item_name',
    CART_ITEM_PRICE: '.inventory_item_price',
    CART_QUANTITY: '.cart_quantity',
    CHECKOUT_BUTTON: '[data-test="checkout"]',
    CONTINUE_SHOPPING_BUTTON: '[data-test="continue-shopping"]',
    REMOVE_BUTTON: '[data-test*="remove"]'
  },
  
  // SauceDemo Checkout elements (real selectors)
  CHECKOUT: {
    FIRST_NAME_INPUT: '[data-test="firstName"]',
    LAST_NAME_INPUT: '[data-test="lastName"]',
    POSTAL_CODE_INPUT: '[data-test="postalCode"]',
    CONTINUE_BUTTON: '[data-test="continue"]',
    FINISH_BUTTON: '[data-test="finish"]',
    CANCEL_BUTTON: '[data-test="cancel"]',
    ERROR_MESSAGE: '[data-test="error"]',
    COMPLETE_HEADER: '.complete-header',
    COMPLETE_TEXT: '.complete-text',
    BACK_HOME_BUTTON: '[data-test="back-to-products"]'
  }
} as const;

// Test data patterns
export const TEST_DATA = {
  // SauceDemo valid users (real test users)
  SAUCEDEMO_USERS: {
    STANDARD_USER: {
      username: 'standard_user',
      password: 'secret_sauce'
    },
    LOCKED_OUT_USER: {
      username: 'locked_out_user',
      password: 'secret_sauce'
    },
    PROBLEM_USER: {
      username: 'problem_user',
      password: 'secret_sauce'
    },
    PERFORMANCE_GLITCH_USER: {
      username: 'performance_glitch_user',
      password: 'secret_sauce'
    },
    ERROR_USER: {
      username: 'error_user',
      password: 'secret_sauce'
    },
    VISUAL_USER: {
      username: 'visual_user',
      password: 'secret_sauce'
    }
  },

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
  },

  // SauceDemo checkout form data
  CHECKOUT_INFO: {
    VALID: {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345'
    },
    INVALID: {
      firstName: '',
      lastName: '',
      postalCode: ''
    }
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
  STAGING: 'https://staging.saucedemo.com',
  PRODUCTION: 'https://saucedemo.com'
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