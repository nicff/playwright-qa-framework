import { test, expect } from '@playwright/test';
import { Config } from '../../utils/config';
import { Logger } from '../e2e/helpers/test-helpers';

test.describe('Environment Configuration Tests', () => {
  
  test('Verify environment configuration is properly loaded', async () => {
    Logger.testStart('Environment Configuration Verification');
    
    Logger.phase(1, 'Check base configuration');
    expect(Config.BASE_URL).toBeTruthy();
    expect(Config.API_BASE_URL).toBeTruthy();
    Logger.success(`Base URL: ${Config.BASE_URL}`);
    Logger.success(`API URL: ${Config.API_BASE_URL}`);
    
    Logger.phase(2, 'Check test user configuration');
    expect(Config.TEST_USER.email).toBeTruthy();
    expect(Config.TEST_USER.password).toBeTruthy();
    expect(Config.TEST_USER.username).toBeTruthy();
    Logger.success('Test user credentials configured');
    
    Logger.phase(3, 'Check feature flags');
    expect(typeof Config.FEATURE_FLAGS.enableApiTests).toBe('boolean');
    expect(typeof Config.FEATURE_FLAGS.enableE2eTests).toBe('boolean');
    Logger.success('Feature flags properly configured');
    
    Logger.phase(4, 'Check environment detection');
    const environment = Config.getCurrentEnvironment();
    expect(environment).toBeTruthy();
    Logger.success(`Current environment: ${environment}`);
  });

  test('Verify URL generation methods work correctly', async () => {
    Logger.testStart('URL Generation Methods');
    
    Logger.phase(1, 'Test getUrl method');
    const homeUrl = Config.getUrl('/');
    const loginUrl = Config.getUrl('/login');
    
    expect(homeUrl).toContain(Config.BASE_URL);
    expect(loginUrl).toContain('/login');
    Logger.success(`Home URL: ${homeUrl}`);
    Logger.success(`Login URL: ${loginUrl}`);
    
    Logger.phase(2, 'Test getApiUrl method');
    const usersApiUrl = Config.getApiUrl('/users');
    const postsApiUrl = Config.getApiUrl('/posts');
    
    expect(usersApiUrl).toContain(Config.API_BASE_URL);
    expect(usersApiUrl).toContain('/users');
    expect(postsApiUrl).toContain('/posts');
    Logger.success(`Users API URL: ${usersApiUrl}`);
    Logger.success(`Posts API URL: ${postsApiUrl}`);
  });

  test('Verify performance thresholds are set', async () => {
    Logger.testStart('Performance Thresholds Configuration');
    
    Logger.phase(1, 'Check performance settings');
    expect(Config.PERFORMANCE.maxPageLoadTime).toBeGreaterThan(0);
    expect(Config.PERFORMANCE.maxApiResponseTime).toBeGreaterThan(0);
    
    Logger.success(`Max page load time: ${Config.PERFORMANCE.maxPageLoadTime}ms`);
    Logger.success(`Max API response time: ${Config.PERFORMANCE.maxApiResponseTime}ms`);
  });

  test('Verify external services configuration', async () => {
    Logger.testStart('External Services Configuration');
    
    Logger.phase(1, 'Check external service URLs');
    expect(Config.EXTERNAL_SERVICES.payment.url).toBeTruthy();
    expect(Config.EXTERNAL_SERVICES.email.url).toBeTruthy();
    expect(Config.EXTERNAL_SERVICES.external.url).toBeTruthy();
    
    Logger.success(`Payment service: ${Config.EXTERNAL_SERVICES.payment.url}`);
    Logger.success(`Email service: ${Config.EXTERNAL_SERVICES.email.url}`);
    Logger.success(`External API: ${Config.EXTERNAL_SERVICES.external.url}`);
  });

});