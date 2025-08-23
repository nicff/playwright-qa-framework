import { test, expect } from '@playwright/test';
import { HTTP_STATUS, TEST_TAGS } from '../../utils/constants';
import { Logger } from '../e2e/helpers/test-helpers';
import apiTestData from '../../fixtures/api-test-data.json' with { type: 'json' };

test.describe('aPI Tests - Posts Management', () => {

  test(`${TEST_TAGS.API} ${TEST_TAGS.SMOKE} Get all posts`, async ({ request }) => {
    Logger.testStart('Get All Posts API Test');
    
    try {
      Logger.phase(1, 'Send GET request to posts endpoint');
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts`);
      
      Logger.phase(2, 'Verify response status and structure');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      Logger.success(`Response status: ${response.status()}`);
      
      const posts = await response.json();
      expect(Array.isArray(posts)).toBeTruthy();
      expect(posts.length).toBeGreaterThan(0);
      Logger.success(`Retrieved ${posts.length} posts`);
      
      Logger.phase(3, 'Verify post object structure');
      const firstPost = posts[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('userId');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('body');
      Logger.success('Post object structure validated');
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Get posts by specific user`, async ({ request }) => {
    Logger.testStart('Get Posts by Specific User');
    
    try {
      const userId = 1;
      Logger.phase(1, `Get posts for user ID: ${userId}`);
      
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts?userId=${userId}`);
      
      Logger.phase(2, 'Verify response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const userPosts = await response.json();
      expect(Array.isArray(userPosts)).toBeTruthy();
      expect(userPosts.length).toBeGreaterThan(0);
      
      // Verify all posts belong to the specified user
      userPosts.forEach((post: { userId: number; id: number; title: string; body: string }) => {
        expect(post.userId).toBe(userId);
      });
      
      Logger.success(`Retrieved ${userPosts.length} posts for user ${userId}`);
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Create new post`, async ({ request }) => {
    Logger.testStart('Create New Post');
    
    try {
      const newPostData = {
        title: `Test Post Title ${Date.now()}`,
        body: 'This is a comprehensive test post body that contains sample content to validate post creation functionality. It includes multiple sentences to simulate real post content.',
        userId: 1
      };
      
      Logger.phase(1, 'Send POST request to create new post');
      const response = await request.post(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts`, {
        data: newPostData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify post creation');
      expect(response.status()).toBe(HTTP_STATUS.CREATED);
      
      const createdPost = await response.json();
      expect(createdPost).toHaveProperty('id');
      expect(createdPost.title).toBe(newPostData.title);
      expect(createdPost.body).toBe(newPostData.body);
      expect(createdPost.userId).toBe(newPostData.userId);
      
      Logger.success(`Post created successfully with ID: ${createdPost.id}`);
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Update existing post`, async ({ request }) => {
    Logger.testStart('Update Existing Post');
    
    try {
      const postId = 1;
      const updatedPostData = {
        id: postId,
        title: `Updated Post Title ${Date.now()}`,
        body: 'This is an updated post body with new content that demonstrates the PUT operation functionality for post updates.',
        userId: 1
      };
      
      Logger.phase(1, `Send PUT request to update post ${postId}`);
      const response = await request.put(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts/${postId}`, {
        data: updatedPostData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify post update');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const updatedPost = await response.json();
      expect(updatedPost.id).toBe(postId);
      expect(updatedPost.title).toBe(updatedPostData.title);
      expect(updatedPost.body).toBe(updatedPostData.body);
      
      Logger.success('Post updated successfully');
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Partial update post with PATCH`, async ({ request }) => {
    Logger.testStart('Partial Update Post with PATCH');
    
    try {
      const postId = 1;
      const patchData = {
        title: `Patched Title ${Date.now()}`
      };
      
      Logger.phase(1, `Send PATCH request to update post title for post ${postId}`);
      const response = await request.patch(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts/${postId}`, {
        data: patchData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      Logger.phase(2, 'Verify partial update');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const patchedPost = await response.json();
      expect(patchedPost.id).toBe(postId);
      expect(patchedPost.title).toBe(patchData.title);
      // Body should remain unchanged (in a real API)
      expect(patchedPost).toHaveProperty('body');
      
      Logger.success('Post title updated successfully via PATCH');
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Delete post`, async ({ request }) => {
    Logger.testStart('Delete Post');
    
    try {
      const postId = 1;
      
      Logger.phase(1, `Send DELETE request for post ${postId}`);
      const response = await request.delete(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts/${postId}`);
      
      Logger.phase(2, 'Verify deletion');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      Logger.success('Post deleted successfully');
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Get comments for specific post`, async ({ request }) => {
    Logger.testStart('Get Comments for Specific Post');
    
    try {
      const postId = 1;
      
      Logger.phase(1, `Get comments for post ID: ${postId}`);
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts/${postId}/comments`);
      
      Logger.phase(2, 'Verify comments response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const comments = await response.json();
      expect(Array.isArray(comments)).toBeTruthy();
      
      if (comments.length > 0) {
        const firstComment = comments[0];
        expect(firstComment).toHaveProperty('id');
        expect(firstComment).toHaveProperty('postId');
        expect(firstComment).toHaveProperty('name');
        expect(firstComment).toHaveProperty('email');
        expect(firstComment).toHaveProperty('body');
        expect(firstComment.postId).toBe(postId);
        
        Logger.success(`Retrieved ${comments.length} comments for post ${postId}`);
      } else {
        Logger.info(`No comments found for post ${postId}`);
      }
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Search posts by title`, async ({ request }) => {
    Logger.testStart('Search Posts by Title');
    
    try {
      // First, get all posts to find a valid title to search for
      Logger.phase(1, 'Get all posts to find searchable title');
      const allPostsResponse = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts`);
      const allPosts: Array<{ userId: number; id: number; title: string; body: string }> = await allPostsResponse.json();
      
      if (allPosts.length > 0) {
        const searchTerm = allPosts[0].title.split(' ')[0]; // Use first word of first post title
        
        Logger.phase(2, `Search posts containing: "${searchTerm}"`);
        
        // Filter posts that contain the search term (simulating search functionality)
        const matchingPosts = allPosts.filter((post: { userId: number; id: number; title: string; body: string }) => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        expect(matchingPosts.length).toBeGreaterThan(0);
        Logger.success(`Found ${matchingPosts.length} posts containing "${searchTerm}"`);
        
        // Verify search results contain the search term
        matchingPosts.forEach((post: { userId: number; id: number; title: string; body: string }) => {
          expect(post.title.toLowerCase()).toContain(searchTerm.toLowerCase());
        });
      }
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

  test(`${TEST_TAGS.API} ${TEST_TAGS.REGRESSION} Pagination of posts`, async ({ request }) => {
    Logger.testStart('Posts Pagination');
    
    try {
      Logger.phase(1, 'Test pagination parameters');
      
      // Simulate pagination by limiting results (JSONPlaceholder supports _limit and _start)
      const limit = 10;
      const start = 0;
      
      const response = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts?_limit=${limit}&_start=${start}`);
      
      Logger.phase(2, 'Verify paginated response');
      expect(response.status()).toBe(HTTP_STATUS.OK);
      
      const paginatedPosts = await response.json();
      expect(Array.isArray(paginatedPosts)).toBeTruthy();
      expect(paginatedPosts.length).toBeLessThanOrEqual(limit);
      
      Logger.success(`Retrieved ${paginatedPosts.length} posts with pagination (limit: ${limit})`);
      
      Logger.phase(3, 'Test second page');
      const secondPageResponse = await request.get(`${apiTestData.endpoints.jsonplaceholder.baseUrl}/posts?_limit=${limit}&_start=${limit}`);
      const secondPagePosts = await secondPageResponse.json();
      
      expect(secondPagePosts.length).toBeGreaterThan(0);
      Logger.success(`Second page retrieved ${secondPagePosts.length} posts`);
      
      // Verify different posts on different pages
      if (paginatedPosts.length > 0 && secondPagePosts.length > 0) {
        expect(paginatedPosts[0].id).not.toBe(secondPagePosts[0].id);
        Logger.success('Pagination correctly returns different posts on different pages');
      }
      
    } catch (error) {
      Logger.error(`API test failed: ${String(error)}`);
      throw error;
    }
  });

});