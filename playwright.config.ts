import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Maximum parallelization for optimal performance
  fullyParallel: true,
  
  // Retry configuration for stability
  retries: process.env.CI ? 2 : 1,
  
  // Test timeout (2 minutes per test)
  timeout: 120000,
  
  // Global timeout (10 minutes total for all tests)
  globalTimeout: 600000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },
  
  // Reporter configuration
  reporter: process.env.CI ? [
    ['github'],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/results.xml' }],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }]
  ] : [
    ['list'],
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
  ],
  
  // Global test configuration
  use: {
    // Multi-environment base URL configuration
    baseURL: process.env.BASE_URL || 'https://demo-app.example.com',
    
    // Browser options
    headless: process.env.CI ? true : false,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Action and navigation timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Browser optimization for faster execution
    launchOptions: {
      args: [
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ]
    }
  },

  // Test projects for different browsers and environments
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Chrome Desktop
    {
      name: 'chrome',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Firefox Desktop  
    {
      name: 'firefox',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'] },
    },
    
    // Safari Desktop
    {
      name: 'safari',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile Chrome
    {
      name: 'mobile-chrome',
      dependencies: ['setup'],
      use: { ...devices['Pixel 5'] },
    },
    
    // Mobile Safari
    {
      name: 'mobile-safari',
      dependencies: ['setup'],
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Local dev server (optional)
  webServer: process.env.NODE_ENV === 'development' ? {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});