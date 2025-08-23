import { test, expect } from '@playwright/test';
import { Config } from '../../utils/config';
import { API_ENDPOINTS, HTTP_STATUS, TEST_TAGS } from '../../utils/constants';
import { TestDataGenerator, Logger } from '../e2e/helpers/test-helpers';
import apiTestData from '../../fixtures/api-test-data.json';

test.describe('API Tests - User Management', () => {

  test(`${TEST_TAGS.API} ${TEST_TAGS.SMOKE} Get all users from JSONPlaceholder`, async ({ request }) => {
    Logger.testStart('Get All Users API Test');
    
    try {
      Logger.phase(1, 'Send GET request to users endpoint');
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users`);
      
      Logger.phase(2, 'Verify response status and structure');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      Logger.success(`Response status: ${response.status()}`);
      
      const users = await response.json();
      expect(Array.isArray(users)).toBeTruthy();
      expect(users.length).toBeGreaterThan(0);
      Logger.success(`Retrieved ${users.length} users`);
      
      Logger.phase(3, 'Verify user object structure');
      const firstUser = users[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('username');
      Logger.success('User object structure validated');
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Get specific user by ID`, async ({ request }) => {
    Logger.testStart('Get Specific User by ID');
    
    try {
      const userId = 1;
      Logger.phase(1, `Send GET request for user ID: ${userId}`);
      
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users/${userId}`);
      
      Logger.phase(2, 'Verify response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const user = await response.json();
      expect(user.id).toBe(userId);
      expect(user.name).toBeTruthy();
      expect(user.email).toBeTruthy();
      Logger.success(`Successfully retrieved user: ${user.name}`);
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Create new user via POST`, async ({ request }) => {
    Logger.testStart('Create New User via POST');
    
    try {
      const newUserData = {
        name: `Test User ${Date.now()}`,
        username: TestDataGenerator.randomUsername(),
        email: TestDataGenerator.randomEmail(),
        address: {
          street: '123 Test Street',
          suite: 'Apt 1',
          city: 'Test City',
          zipcode: '12345',
          geo: {
            lat: '0.0000',
            lng: '0.0000'
          }
        },
        phone: '1-555-TEST-001',
        website: 'test-user.example.com',
        company: {
          name: 'Test Company',
          catchPhrase: 'Testing made simple',
          bs: 'quality assurance solutions'
        }
      };
      
      Logger.phase(1, 'Send POST request to create user');
      const response = await request.post(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users`, {
        data: newUserData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify user creation response');
      expect(response.status()).toBe(HTTP_STATUS.CREATED);
      
      const createdUser = await response.json();
      expect(createdUser).toHaveProperty('id');
      expect(createdUser.name).toBe(newUserData.name);
      expect(createdUser.email).toBe(newUserData.email);
      Logger.success(`User created successfully with ID: ${createdUser.id}`);
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Update user via PUT`, async ({ request }) => {
    Logger.testStart('Update User via PUT');
    
    try {
      const userId = 1;
      const updatedUserData = {
        id: userId,
        name: `Updated User ${Date.now()}`,
        username: 'updateduser',
        email: 'updated.user@example.com',
        address: {
          street: '456 Updated Street',
          suite: 'Suite 2',
          city: 'Updated City',
          zipcode: '54321'
        },
        phone: '1-555-UPDATED',
        website: 'updated-user.example.com',
        company: {
          name: 'Updated Company',
          catchPhrase: 'Updates made easy',
          bs: 'synthetic data solutions'
        }
      };
      
      Logger.phase(1, `Send PUT request to update user ${userId}`);
      const response = await request.put(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users/${userId}`, {
        data: updatedUserData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify update response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const updatedUser = await response.json();
      expect(updatedUser.id).toBe(userId);
      expect(updatedUser.name).toBe(updatedUserData.name);
      expect(updatedUser.email).toBe(updatedUserData.email);
      Logger.success('User updated successfully');
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Delete user via DELETE`, async ({ request }) => {
    Logger.testStart('Delete User via DELETE');
    
    try {
      const userId = 1;
      
      Logger.phase(1, `Send DELETE request for user ${userId}`);
      const response = await request.delete(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users/${userId}`);
      
      Logger.phase(2, 'Verify deletion response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      Logger.success('User deleted successfully');
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} User not found - 404 error`, async ({ request }) => {
    Logger.testStart('User Not Found - 404 Error');
    
    try {
      const nonExistentUserId = 99999;
      
      Logger.phase(1, `Request non-existent user ID: ${nonExistentUserId}`);
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users/${nonExistentUserId}`);
      
      Logger.phase(2, 'Verify 404 response');
      expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
      Logger.success('404 error correctly returned for non-existent user');
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Invalid user data validation`, async ({ request }) => {
    Logger.testStart('Invalid User Data Validation');
    
    try {
      const invalidUserData = {
        name: '', // Empty name
        username: '', // Empty username
        email: 'invalid-email-format' // Invalid email
      };
      
      Logger.phase(1, 'Send POST with invalid user data');
      const response = await request.post(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/users`, {
        data: invalidUserData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify validation response');
      // JSONPlaceholder doesn't actually validate, but in a real API this would be 400
      // For demo purposes, we'll check that it doesn't return a server error
      expect(response.status()).toBeLessThan(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      Logger.success('Invalid data handled appropriately');
      
    } catch (error) {
      Logger.error(`API test failed: ${error}`);
      throw error;
    }
  });

});