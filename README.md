# SDET Automation Framework

> **Professional automation framework showcasing modern SDET/QA practices and skills**

[![CI/CD Pipeline](https://github.com/nicff/playwright-qa-framework/actions/workflows/ci.yml/badge.svg?branch=main&event=status)](https://github.com/nicff/playwright-qa-framework/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2D4A87?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

A comprehensive, production-ready test automation framework demonstrating industry best practices for **SDET and QA Automation roles**.  
Built with TypeScript, Playwright, and modern CI/CD integration.

---

## 🎯 Framework Overview

This repository showcases a professional-grade automation framework designed for scalable web application testing.  
**All code and test scenarios are completely generic and synthetic. No proprietary business logic or real-world data is included.**

---

### 🔧 Technology Stack

| Category           | Technology        | Purpose                           |
|--------------------|------------------|-----------------------------------|
| **Core Framework** | Playwright       | Cross-browser E2E & API testing   |
| **Language**       | TypeScript       | Type-safe test development        |
| **Runtime**        | Node.js 18+      | JavaScript runtime environment    |
| **CI/CD**          | GitHub Actions   | Automated testing pipeline        |
| **Reporting**      | HTML Reports     | Visual test result documentation  |
| **Code Quality**   | ESLint + Prettier| Code linting and formatting       |

---

## 🏗️ Architecture Highlights

- **Page Object Model** for maintainable UI tests
- **Modular helper functions** for code reusability
- **Multi-environment configuration** (Local, Staging, Production)
- **Parallel test execution** with intelligent sharding
- **Comprehensive reporting** with screenshots and videos
- **Advanced CI/CD integration** with dynamic workflow configuration
- **Type-safe development** (TypeScript everywhere)
- **Security-first approach** with proper secret management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm 8 or higher

### Installation

```bash
git clone https://github.com/nicff/playwright-sdet-automation-framework.git
cd playwright-sdet-automation-framework
npm install

# Install browsers
npm run browsers:install

# Set up environment configuration
cp .env.example .env
# Edit .env with your preferred settings

# Verify setup
npm run health-check      # Test environment connectivity
npm run type-check        # Verify TypeScript setup
```

### Running Tests

```bash
# First time setup
npm run setup             # Install dependencies, browsers, and run type check

# Basic test execution
npm test                  # Run all tests with default configuration
npm run test:headed       # Run tests with browser UI visible
npm run test:debug        # Run tests in debug mode
npm run test:ui           # Open Playwright test UI

# Test suites by category
npm run test:smoke        # Quick validation tests (@smoke)
npm run test:regression   # Full regression suite (@regression)
npm run test:critical     # Critical path tests (@critical)
npm run test:sanity       # Basic sanity checks (@sanity)

# Test suites by type
npm run test:e2e          # All end-to-end tests
npm run test:e2e:auth     # Authentication tests only
npm run test:e2e:ecommerce # Ecommerce flow tests
npm run test:api          # API tests only

# Multi-browser execution
npm run test:chrome       # Chromium browser
npm run test:firefox      # Firefox browser  
npm run test:safari       # WebKit/Safari browser
npm run test:mobile       # Mobile browsers (Chrome + Safari)

# Environment-specific testing
npm run test:local        # Local development (localhost:3000)
npm run test:staging      # Staging environment
npm run test:prod         # Production environment

# Execution modes
npm run test:parallel     # Parallel execution (50% CPU cores)
npm run test:serial       # Sequential execution
npm run test:fast         # Fast execution with minimal output

# Reporting and analysis
npm run report            # View latest HTML report
npm run report:open       # Generate and open HTML report
npm run report:json       # Generate JSON report
npm run report:html       # Generate HTML report

# Maintenance
npm run browsers:install  # Install/update browsers
npm run browsers:list     # List available browsers
npm run clean             # Clean test artifacts
npm run clean:install     # Clean and fresh install

# Code quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run format            # Format code with Prettier
npm run type-check        # TypeScript type checking

# CI/CD specific
npm run test:ci           # CI-optimized test run
npm run health-check      # Environment connectivity check
```

## 📁 Project Structure

```
playwright-sdet-automation-framework/
├── .github/workflows/          # CI/CD pipeline configuration
│   └── ci.yml                 # GitHub Actions workflow
├── tests/                     # Test specifications
│   ├── e2e/                   # End-to-end tests
│   │   ├── auth/              # Authentication tests
│   │   │   ├── login.spec.ts
│   │   │   └── registration.spec.ts
│   │   ├── ecommerce/         # Ecommerce flow tests
│   │   │   ├── complete-purchase-flow.spec.ts
│   │   │   └── product-catalog.spec.ts
│   │   └── helpers/           # Test helper functions
│   │       └── test-helpers.ts
│   ├── api/                   # API test specifications
│   │   ├── auth-api.spec.ts
│   │   ├── users-api.spec.ts
│   │   └── posts-api.spec.ts
│   └── config/                # Environment configuration tests
├── fixtures/                  # Test data and fixtures
│   ├── test-users.json        # Synthetic user data
│   ├── test-products.json     # Sample product data
│   └── api-test-data.json     # API endpoint configurations
├── utils/                     # Utility modules
│   ├── config.ts              # Environment configuration
│   └── constants.ts           # Test constants and selectors
├── reports/                   # Test execution reports
├── playwright.config.ts       # Playwright configuration
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🧪 Test Categories

### Authentication Tests (`tests/e2e/auth/`)
- ✅ User registration with validation
- ✅ Login/logout functionality  
- ✅ Form validation and error handling
- ✅ Password strength requirements
- ✅ Session management

### Ecommerce Tests (`tests/e2e/ecommerce/`)
- ✅ Complete purchase flow (registration → product selection → checkout → confirmation)
- ✅ Product catalog browsing and filtering
- ✅ Shopping cart operations
- ✅ Guest checkout process
- ✅ Payment form validation

### API Tests (`tests/api/`)
- ✅ RESTful API operations (GET, POST, PUT, DELETE)
- ✅ Authentication and authorization
- ✅ Request/response validation
- ✅ Error handling and status codes
- ✅ Data serialization/deserialization

## 🎨 Key Features

### Test Design Patterns

- **Page Object Model**: Encapsulated page interactions for maintainability
- **Helper Functions**: Reusable utilities for common test operations
- **Data-Driven Testing**: External test data files for flexible test scenarios
- **Synthetic Test Data**: Completely generic data with no real-world references

### Quality Assurance Practices

- **Parallel Execution**: Optimized test runtime with concurrent execution and intelligent sharding
- **Cross-Browser Testing**: Chrome, Firefox, Safari, and mobile browser support
- **Screenshot/Video Capture**: Automatic failure documentation
- **Retry Mechanisms**: Configurable retry logic for flaky test scenarios
- **Environment Isolation**: Separate configurations for different test environments

### CI/CD Integration

- **Dynamic Workflow Configuration**: Intelligent test suite selection based on trigger type
- **Multi-Environment Support**: Configurable deployment testing (staging/production)
- **Comprehensive Reporting**: HTML reports with execution history and GitHub integration
- **Security-First Approach**: Proper secret management and private artifact storage
- **Intelligent Sharding**: E2E tests split into 4 shards, regression tests with cross-browser matrix
- **Fail-Fast Quality Gates**: Code quality checks block downstream jobs on failure

## 📊 Reporting and Analytics

### HTML Reports
- Visual test execution dashboard generated in `playwright-report/` directory
- Screenshot and video capture on failures stored in `test-results/`
- Timeline view of test execution with detailed error information
- Filterable results by status, browser, and test suite
- **CI/CD Access**: HTML reports are available as downloadable artifacts in GitHub Actions workflow runs

### CI/CD Integration
- GitHub Actions workflow with dynamic badges
- Pull request status checks with detailed test results
- Automated test result publishing to GitHub's native test reporting
- Consolidated reporting that merges results from all test jobs
- Historical test execution trends and metrics

## 🔧 Configuration

### Environment Variables

The framework supports flexible configuration through environment variables:

```bash
# Application settings
BASE_URL=https://demo-app.example.com
API_BASE_URL=https://api.demo-app.example.com/v1
NODE_ENV=production

# Test execution settings
HEADLESS=true
WORKERS=4
TEST_TIMEOUT=120000

# Feature flags
ENABLE_API_TESTS=true
ENABLE_E2E_TESTS=true
ENABLE_MOBILE_TESTS=false
```

### Multi-Environment Support

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| **Local** | Development testing | `npm run test:local` |
| **Staging** | Pre-production validation | `npm run test:staging` |
| **Production** | Live environment monitoring | `npm run test:prod` |

## 🔒 Secrets Management in CI/CD

**Important**: This framework uses proper secret management practices. All sensitive data (API tokens, credentials) are **never hardcoded** in the codebase.

### GitHub Repository Configuration

To configure secrets for CI/CD workflows:

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **"New repository secret"** and add the following:

**Required Secrets (Demo Framework):**
```
API_TEST_TOKEN: your-demo-api-token
TEST_USER_EMAIL: your-test-user@example.com
TEST_USER_PASSWORD: your-secure-test-password
ADMIN_USER_EMAIL: your-admin-user@example.com
ADMIN_USER_PASSWORD: your-secure-admin-password
```

**Optional Secrets (Advanced Features):**
```
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
API_CLIENT_ID: your-oauth-client-id
API_CLIENT_SECRET: your-oauth-client-secret
```

The CI/CD workflow will automatically use these secrets while falling back to safe demo values for public demonstration.

## 🛠️ How to Customize Linting/Formatting

### ESLint Configuration

Edit `.eslintrc.js` to modify linting rules:

```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:playwright/playwright-test'
  ],
  rules: {
    // Add or modify rules here
    '@typescript-eslint/no-unused-vars': 'error',
    'playwright/expect-expect': 'warn'
  }
};
```

### Prettier Configuration

Edit `.prettierrc` to change formatting rules:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Manual Execution

```bash
# Run linting manually
npm run lint                    # Check for linting issues
npm run lint:fix                # Auto-fix linting issues

# Run formatting manually  
npm run format                  # Format all files
npm run format:check            # Check if files need formatting
```

## 🏆 Professional Skills Demonstrated

### Technical Expertise
- **Modern Test Frameworks**: Playwright, TypeScript, Node.js ecosystem
- **Test Architecture**: Scalable, maintainable test design patterns
- **API Testing**: RESTful service validation and contract testing
- **Cross-Browser Testing**: Multi-browser compatibility validation
- **CI/CD Integration**: Advanced pipeline automation with intelligent workflow configuration

### QA Best Practices
- **Test Strategy**: Comprehensive smoke, regression, and integration test coverage
- **Data Management**: Synthetic test data generation and management
- **Environment Management**: Multi-environment test execution strategy
- **Reporting**: Professional test reporting and failure analysis
- **Code Quality**: Linting, formatting, and type safety enforcement

### DevOps Integration
- **Pipeline Automation**: Advanced GitHub Actions workflow with dynamic configuration
- **Security Management**: Proper secret handling and artifact management
- **Monitoring**: Test execution monitoring and intelligent alerting
- **Scalability**: Horizontal scaling through parallel execution and sharding
- **Documentation**: Professional documentation and comprehensive setup guides

## 🔧 Troubleshooting & FAQ

### Common Issues and Solutions

#### 1. Playwright Version Mismatch
**Error**: `browserType.launch: Executable doesn't exist`
```bash
# Solution: Reinstall browsers for current Playwright version
npm run browsers:install
# Or force reinstall
npx playwright install --force
```

#### 2. Permission Issues (Linux/Mac)
**Error**: `EACCES: permission denied`
```bash
# Solution: Fix npm permissions or use Node Version Manager
sudo chown -R $(whoami) ~/.npm
# Or install/use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 3. Missing Secrets in CI/CD
**Error**: Tests fail with authentication errors in CI
```bash
# Solution: Configure required secrets in GitHub repository settings
# Go to: Settings > Secrets and variables > Actions > Repository secrets
# Add: API_TEST_TOKEN, TEST_USER_EMAIL, TEST_USER_PASSWORD, etc.
```

#### 4. TypeScript Build Errors
**Error**: `Cannot find module` or type errors
```bash
# Solution: Clean and reinstall dependencies
npm run clean:install
# Or manually clean and reinstall
rm -rf node_modules package-lock.json
npm ci
npm run type-check
```

#### 5. ESLint/Prettier Not Running
**Error**: Code style inconsistencies or linting issues
```bash
# Solution: Manually run code quality tools
npm run lint:fix          # Fix ESLint issues
npm run format            # Format code with Prettier
npm run type-check        # Verify TypeScript
```

#### 6. Test Results Not Generated
**Error**: Missing HTML reports or artifacts
```bash
# Solution: Ensure reports directory exists and check permissions
mkdir -p reports test-results playwright-report
# Run tests with explicit reporting
npm test -- --reporter=html,json,junit
```

## ⚠️ Limitations & Known Gaps

This framework focuses on web automation and CI/CD integration. The following areas are **not covered**:

### Testing Types Not Included
- **Native Mobile Testing**: iOS/Android app automation (requires Appium or similar)
- **BDD/Gherkin**: Behavior-driven development with Cucumber or similar frameworks
- **Performance/Load Testing**: High-volume stress testing (requires JMeter, Artillery, or k6)
- **Visual Regression Testing**: Pixel-perfect UI comparison (requires dedicated visual testing tools)
- **Accessibility Testing**: WCAG compliance and screen reader testing

### Integration Limitations
- **Database Testing**: Direct database validation and data manipulation
- **External Service Mocking**: Advanced mocking/stubbing of third-party services
- **Message Queue Testing**: Kafka, RabbitMQ, or similar messaging system validation
- **Desktop Application Testing**: Native Windows/Mac application automation

### Advanced Features Not Implemented
- **Docker/Containerization**: Container-based test execution
- **Kubernetes Integration**: Cloud-native test orchestration
- **Advanced Monitoring**: APM integration, custom metrics collection
- **Multi-tenant Testing**: Complex user role and permission testing scenarios

### Infrastructure Gaps
- **Multi-Cloud CI/CD**: Currently GitHub Actions only (no Jenkins, GitLab CI, etc.)
- **Test Data Factories**: Advanced test data generation and management
- **Real Device Testing**: Physical device testing (requires cloud testing services)

## 📋 TODO / Roadmap

Future enhancements planned for this framework:

### Near Term (Next 3-6 months)
1. **Visual Regression Testing**: Integrate screenshot comparison with Percy or similar service
2. **Extended API Coverage**: Add GraphQL testing capabilities and contract testing with Pact
3. **Docker Support**: Containerize test execution for consistent environments
4. **Database Integration**: Add database seeding and validation helpers

### Medium Term (6-12 months)
1. **Performance Testing Integration**: Add basic performance assertions and monitoring
2. **Advanced Reporting**: Implement test trend analysis and dashboard integration
3. **Multi-Cloud CI/CD**: Add support for GitLab CI and Jenkins pipelines
4. **Accessibility Testing**: Integrate axe-core for automated accessibility validation

### Long Term (12+ months)
1. **Mobile Testing**: Extend framework for React Native and mobile web testing
2. **BDD Integration**: Add Cucumber.js support for behavior-driven testing
3. **AI-Powered Testing**: Explore ML-based test generation and maintenance
4. **Microservices Testing**: Advanced service mesh and distributed system testing patterns

## 🤝 Contributing

This is a showcase repository demonstrating QA automation skills. However, contributions are welcome to improve the framework:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add new test scenario'`)
4. Push to the branch (`git push origin feature/improvement`)  
5. Create a Pull Request

## 📋 Requirements

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Modern browsers (Chrome, Firefox, Safari)
- Git for version control

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testing Best Practices](https://martinfowler.com/testing/)

## 📞 Contact

**Professional QA Engineer Profile**

This repository demonstrates professional-level test automation skills suitable for:
- Senior QA Engineer roles
- SDET (Software Development Engineer in Test) positions  
- Test Automation Engineer opportunities
- Quality Engineering leadership roles

---

## ⚠️ Important Notice

**This repository contains only generic, synthetic test code and data. No proprietary business logic, real user data, or company-specific information is included. All test scenarios, data, and configurations are completely fictional and created solely for demonstration purposes.**