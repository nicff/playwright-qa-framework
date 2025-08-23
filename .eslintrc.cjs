module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:playwright/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'playwright'],
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',

    // General ESLint rules
    'no-console': 'off', // Allow console.log for test logging
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-await-in-loop': 'warn',
    'no-return-await': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'require-await': 'error',
    'no-unused-vars': 'off', // Handled by TypeScript
    'no-undef': 'off', // Handled by TypeScript

    // Playwright specific rules
    'playwright/missing-playwright-await': 'error',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-element-handle': 'error',
    'playwright/no-eval': 'error',
    'playwright/no-focused-test': 'error',
    'playwright/no-force-option': 'warn',
    'playwright/no-page-pause': 'error',
    'playwright/no-restricted-matchers': 'off',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-useless-await': 'error',
    'playwright/no-wait-for-timeout': 'warn',
    'playwright/prefer-lowercase-title': 'error',
    'playwright/prefer-to-be': 'error',
    'playwright/prefer-to-have-length': 'error',

    // Code style
    'indent': 'off', // Handled by Prettier
    'quotes': 'off', // Handled by Prettier
    'semi': 'off', // Handled by Prettier
    'comma-dangle': 'off', // Handled by Prettier
    'max-len': ['warn', { 
      code: 120, 
      ignoreUrls: true, 
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true
    }],

    // Testing specific
    'no-magic-numbers': 'off', // Common in tests for timeouts, etc.
    'no-duplicate-imports': 'error',
    'prefer-promise-reject-errors': 'error'
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.test.ts', '**/tests/**/*.ts'],
      rules: {
        // Relax some rules for test files
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        'max-len': 'off',
        'no-magic-numbers': 'off'
      }
    },
    {
      files: ['playwright.config.ts', '*.config.ts', '*.config.js'],
      rules: {
        // Config files may need different rules
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    'reports/',
    'test-results/',
    'playwright-report/',
    'coverage/',
    '*.d.ts',
    '.eslintrc.js'
  ]
};