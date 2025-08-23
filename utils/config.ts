import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration management for the QE Automation Framework
 * Provides centralized access to environment variables and test settings
 */
export class Config {
  
  // Application URLs
  static readonly BASE_URL = process.env.BASE_URL || 'https://demo-app.example.com';
  static readonly API_BASE_URL = process.env.API_BASE_URL || 'https://api.demo-app.example.com/v1';
  
  // Test execution settings
  static readonly HEADLESS = process.env.HEADLESS === 'true' || process.env.CI === 'true';
  static readonly WORKERS = parseInt(process.env.WORKERS || '0') || undefined;
  static readonly TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT || '120000');
  static readonly ACTION_TIMEOUT = parseInt(process.env.ACTION_TIMEOUT || '10000');
  
  // Test user credentials
  static readonly TEST_USER = {
    email: process.env.TEST_USER_EMAIL || 'test.user@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    username: process.env.TEST_USER_USERNAME || 'testuser2024'
  };
  
  static readonly ADMIN_USER = {
    email: process.env.ADMIN_USER_EMAIL || 'admin.user@example.com',
    password: process.env.ADMIN_USER_PASSWORD || 'AdminPassword123!'
  };
  
  // API configuration
  static readonly API_CONFIG = {
    token: process.env.API_TEST_TOKEN || 'demo_api_token_12345',
    clientId: process.env.API_CLIENT_ID || 'demo_client_id',
    clientSecret: process.env.API_CLIENT_SECRET || 'demo_client_secret'
  };
  
  // External service configurations (all demo/mock services)
  static readonly EXTERNAL_SERVICES = {
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'https://mock-payment.example.com',
      apiKey: process.env.PAYMENT_API_KEY || 'mock_payment_key_12345'
    },
    email: {
      url: process.env.EMAIL_SERVICE_URL || 'https://mock-email.example.com',
      apiKey: process.env.EMAIL_API_KEY || 'mock_email_key_67890'
    },
    external: {
      url: process.env.EXTERNAL_API_URL || 'https://jsonplaceholder.typicode.com',
      apiKey: process.env.EXTERNAL_API_KEY || 'demo_external_api_key'
    }
  };
  
  // Feature flags
  static readonly FEATURE_FLAGS = {
    enableApiTests: process.env.ENABLE_API_TESTS !== 'false',
    enableE2eTests: process.env.ENABLE_E2E_TESTS !== 'false',
    enableSmokeTests: process.env.ENABLE_SMOKE_TESTS !== 'false',
    enableRegressionTests: process.env.ENABLE_REGRESSION_TESTS !== 'false',
    enableAuthTests: process.env.ENABLE_AUTH_TESTS !== 'false',
    enableEcommerceTests: process.env.ENABLE_ECOMMERCE_TESTS !== 'false',
    enablePaymentTests: process.env.ENABLE_PAYMENT_TESTS !== 'false',
    enableMobileTests: process.env.ENABLE_MOBILE_TESTS === 'true'
  };
  
  // Performance thresholds
  static readonly PERFORMANCE = {
    maxPageLoadTime: parseInt(process.env.MAX_PAGE_LOAD_TIME || '3000'),
    maxApiResponseTime: parseInt(process.env.MAX_API_RESPONSE_TIME || '1000')
  };
  
  // Environment detection
  static readonly ENVIRONMENT = {
    isCI: process.env.CI === 'true',
    isDev: process.env.NODE_ENV === 'development',
    isStaging: process.env.NODE_ENV === 'staging',
    isProd: process.env.NODE_ENV === 'production'
  };
  
  /**
   * Get environment-specific URL
   * @param path - Path to append to base URL
   * @returns Complete URL for the current environment
   */
  static getUrl(path: string = ''): string {
    const baseUrl = this.BASE_URL.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
  
  /**
   * Get API URL with endpoint
   * @param endpoint - API endpoint
   * @returns Complete API URL
   */
  static getApiUrl(endpoint: string): string {
    const baseUrl = this.API_BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  /**
   * Check if a feature is enabled
   * @param feature - Feature name
   * @returns Boolean indicating if feature is enabled
   */
  static isFeatureEnabled(feature: keyof typeof Config.FEATURE_FLAGS): boolean {
    return this.FEATURE_FLAGS[feature];
  }
  
  /**
   * Get current environment name
   * @returns Environment name string
   */
  static getCurrentEnvironment(): string {
    if (this.ENVIRONMENT.isProd) return 'production';
    if (this.ENVIRONMENT.isStaging) return 'staging';
    if (this.ENVIRONMENT.isDev) return 'development';
    return 'unknown';
  }
}