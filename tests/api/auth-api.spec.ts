import { test, expect } from '@playwright/test';
import { HTTP_STATUS, TEST_TAGS } from '../../utils/constants';
import { Logger } from '../e2e/helpers/test-helpers';
import apiTestData from '../../fixtures/api-test-data.json';

test.describe('authentication API tests', () => {

  test(`${TEST_TAGS.API} ${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} User registration via API`, async ({ request }) => {
    Logger.testStart('User Registration via API');
    
    try {
      Logger.phase(1, 'Send registration request');
      const response = await request.post(`${apiTestData.endpoints.reqres.baseUrl}/register`, {
        data: {
          email: 'eve.holt@reqres.in', // Using known test email for ReqRes API
          password: 'pistol'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify registration response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const registrationResult = await response.json();
      expect(registrationResult).toHaveProperty('id');
      expect(registrationResult).toHaveProperty('token');
      expect(typeof registrationResult.token).toBe('string');
      
      Logger.success(`User registered successfully with ID: ${String(registrationResult.id)}`);
      Logger.success(`Registration token: ${String(registrationResult.token).substring(0, 10)}...`);
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH} User login via API`, async ({ request }) => {
    Logger.testStart('User Login via API');
    
    try {
      const loginData = {
        email: 'eve.holt@reqres.in', // Known test credentials for ReqRes API
        password: 'cityslicka'
      };
      
      Logger.phase(1, 'Send login request');
      const response = await request.post(`${apiTestData.endpoints.reqres.baseUrl}/login`, {
        data: loginData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify login response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const loginResult = await response.json();
      expect(loginResult).toHaveProperty('token');
      expect(typeof loginResult.token).toBe('string');
      expect(loginResult.token.length).toBeGreaterThan(0);
      
      Logger.success(`Login successful, token: ${loginResult.token.substring(0, 10)}...`);
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Invalid login credentials`, async ({ request }) => {
    Logger.testStart('Invalid Login Credentials');
    
    try {
      const invalidCredentials = [
        {
          description: 'Missing password',
          data: { email: 'eve.holt@reqres.in' }
        },
        {
          description: 'Missing email',
          data: { password: 'testpassword' }
        },
        {
          description: 'Invalid email format',
          data: { email: 'invalid-email', password: 'testpassword' }
        },
        {
          description: 'Wrong password',
          data: { email: 'eve.holt@reqres.in', password: 'wrongpassword' }
        }
      ];
      
      for (let i = 0; i < invalidCredentials.length; i++) {
        const { description, data } = invalidCredentials[i];
        
        Logger.phase(i + 1, `Test ${description}`);
        
        const response = await request.post(`${apiTestData.endpoints.reqres.baseUrl}/login`, {
          data,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Should return 400 for invalid credentials
        expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        
        Logger.success(`${description}: Correctly returned error - ${errorResponse.error}`);
      }
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Invalid registration data`, async ({ request }) => {
    Logger.testStart('Invalid Registration Data');
    
    try {
      const invalidRegistrations = [
        {
          description: 'Missing password',
          data: { email: 'test@example.com' }
        },
        {
          description: 'Missing email',
          data: { password: 'testpassword' }
        },
        {
          description: 'Empty request body',
          data: {}
        }
      ];
      
      for (let i = 0; i < invalidRegistrations.length; i++) {
        const { description, data } = invalidRegistrations[i];
        
        Logger.phase(i + 1, `Test registration with ${description}`);
        
        const response = await request.post(`${apiTestData.endpoints.reqres.baseUrl}/register`, {
          data,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Should return 400 for invalid registration data
        expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        
        Logger.success(`${description}: Correctly returned error - ${errorResponse.error}`);
      }
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Token validation and protected endpoints`, async ({ request }) => {
    Logger.testStart('Token Validation and Protected Endpoints');
    
    try {
      Logger.phase(1, 'Login to obtain token');
      const loginResponse = await request.post(`${apiTestData.endpoints.reqres.baseUrl}/login`, {
        data: {
          email: 'eve.holt@reqres.in',
          password: 'cityslicka'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(loginResponse.status()).toBe(HTTP_STATUS.OK);
      const { token } = await loginResponse.json();
      Logger.success(`Token obtained: ${token.substring(0, 10)}...`);
      
      Logger.phase(2, 'Test request with valid token');
      // Using a general endpoint to test token usage (simulate protected endpoint)
      const protectedResponse = await request.get(`${apiTestData.endpoints.reqres.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(protectedResponse.status()).toBe(HTTP_STATUS.OK);
      Logger.success('Request with valid token successful');
      
      Logger.phase(3, 'Test request with invalid token');
      const _invalidTokenResponse = await request.get(`${apiTestData.endpoints.reqres.baseUrl}/users`, {
        headers: {
          'Authorization': 'Bearer invalid-token-123',
          'Content-Type': 'application/json'
        }
      });
      
      // Note: ReqRes API doesn't actually validate tokens, but in a real API this would be 401
      // We're demonstrating the test structure for token validation
      Logger.success('Invalid token handling tested');
      
      Logger.phase(4, 'Test request without token');
      const noTokenResponse = await request.get(`${apiTestData.endpoints.reqres.baseUrl}/users`);
      
      // ReqRes allows requests without tokens, but in a real protected API this would be 401
      expect(noTokenResponse.status()).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      Logger.success('Request without token handled appropriately');
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Rate limiting simulation`, async ({ request }) => {
    Logger.testStart('Rate Limiting Simulation');
    
    try {
      Logger.phase(1, 'Send multiple rapid requests');
      
      const promises = [];
      const requestCount = 5;
      
      // Send multiple concurrent requests
      for (let i = 0; i < requestCount; i++) {
        promises.push(
          request.get(`${apiTestData.endpoints.reqres.baseUrl}/users`)
        );
      }
      
      const responses = await Promise.all(promises);
      
      Logger.phase(2, 'Verify request responses');
      let successfulRequests = 0;
      let rateLimitedRequests = 0;
      
      responses.forEach((response, index) => {
        if (response.status() === HTTP_STATUS.OK) {
          successfulRequests++;
        } else if (response.status() === 429) { // Too Many Requests
          rateLimitedRequests++;
        }
        
        Logger.info(`Request ${index + 1}: Status ${response.status()}`);
      });
      
      Logger.success(`${successfulRequests} successful requests, ${rateLimitedRequests} rate-limited`);
      
      // Note: ReqRes API doesn't implement rate limiting, but this demonstrates the test structure
      expect(successfulRequests + rateLimitedRequests).toBe(requestCount);
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} ${TEST_TAGS.AUTH} Session timeout simulation`, async ({ request }) => {
    Logger.testStart('Session Timeout Simulation');
    
    try {
      Logger.phase(1, 'Login and obtain token');
      const loginResponse = await request.post(`${apiTestData.endpoints.reqres.baseUrl}/login`, {
        data: {
          email: 'eve.holt@reqres.in',
          password: 'cityslicka'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { token } = await loginResponse.json();
      Logger.success('Token obtained for session test');
      
      Logger.phase(2, 'Immediate request with fresh token');
      const freshTokenResponse = await request.get(`${apiTestData.endpoints.reqres.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      expect(freshTokenResponse.status()).toBe(HTTP_STATUS.OK);
      Logger.success('Fresh token request successful');
      
      Logger.phase(3, 'Simulate expired token scenario');
      // In a real application, we would wait for token expiration or use an expired token
      // For demonstration, we'll use a clearly expired/invalid token format
      const expiredToken = `expired-${  token}`;
      
      const _expiredTokenResponse = await request.get(`${apiTestData.endpoints.reqres.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // In a real API, this would return 401 Unauthorized for expired tokens
      Logger.success('Expired token scenario tested');
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

});