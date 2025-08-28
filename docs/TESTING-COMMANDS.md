# 🧪 Testing Commands Guide

This guide explains all available commands for running tests in the framework, optimized for different needs and scenarios.

## 🔥 IMPORTANT: Headless Mode by Default
**All commands run in headless mode (no visible browser) by default for maximum speed.**
**Add `:headed` to any command when you need to see the browser.**

## 🚀 Main Commands (Daily Development)

### Default Command - Chrome Only (Headless)
```bash
npm test
# or
npm run test
```
**When to use?** For daily development. Runs all tests only on Chrome headless (~200 tests in ~8-12 minutes).

### Development Commands
```bash
npm run test:headed        # See Chrome browser while running
npm run test:debug         # Step-by-step debug mode (always headed)
npm run test:ui            # Playwright UI interface
npm run test:watch         # Watch mode with visible browser
```

## 🔍 Testing by Specific Area

### Headless (Default - Fast)
```bash
npm run test:e2e:auth           # Authentication tests
npm run test:e2e:ecommerce      # E-commerce tests
npm run test:e2e:navigation     # Navigation tests
npm run test:security           # Security tests
npm run test:performance        # Performance tests
npm run test:api                # API tests
```

### With Visible Browser (For debugging)
```bash
npm run test:e2e:auth:headed       # Authentication tests (see browser)
npm run test:e2e:ecommerce:headed  # E-commerce tests (see browser)
npm run test:e2e:navigation:headed # Navigation tests (see browser)
npm run test:security:headed       # Security tests (see browser)
npm run test:performance:headed    # Performance tests (see browser)
```

## 🏷️ Testing by Tags

### Headless (Default)
```bash
npm run test:smoke              # Critical smoke tests (~20 tests)
npm run test:critical           # Critical tests (~50 tests)
npm run test:regression         # Regression tests (~150 tests)
npm run test:sanity             # Sanity tests (~30 tests)
```

### With Visible Browser
```bash
npm run test:smoke:headed       # Smoke tests (see browser)
npm run test:critical:headed    # Critical tests (see browser)
npm run test:regression:headed  # Regression tests (see browser)
npm run test:sanity:headed      # Sanity tests (see browser)
```

## 🌐 Deep Testing and Cross-Browser

### Headless (Recommended for speed)
```bash
npm run test:full               # Chrome + Firefox + Safari
npm run test:cross-browser      # All browsers + mobile
npm run test:all                # ALL configured projects
```

### With Visible Browsers (For demos/presentations)
```bash
npm run test:full:headed        # Chrome + Firefox + Safari (see browsers)
npm run test:cross-browser:headed # All browsers + mobile (see browsers)
```

### Testing by Specific Browser
```bash
# Headless
npm run test:chrome             # Chrome only
npm run test:firefox            # Firefox only
npm run test:safari             # Safari only
npm run test:mobile             # Mobile only

# With visible browser
npm run test:chrome:headed      # Chrome only (visible)
npm run test:firefox:headed     # Firefox only (visible)
npm run test:safari:headed      # Safari only (visible)
npm run test:mobile:headed      # Mobile only (visible)
```

## 🌍 Testing by Environment

### Headless
```bash
npm run test:prod               # Production (saucedemo.com)
npm run test:staging            # Staging
npm run test:local              # Local (localhost:3000)
```

### With visible browser
```bash
npm run test:prod:headed        # Production (see browser)
npm run test:staging:headed     # Staging (see browser)
npm run test:local:headed       # Local (see browser)
```

## ⚡ Optimization Commands

```bash
npm run test:parallel           # Optimized parallel execution (headless)
npm run test:retry              # With 3 automatic retries (headless)
npm run test:slow               # For slow tests (with visible browser)
```

## 📊 Reports

```bash
npm run report                  # View latest HTML report
npm run report:open             # Open report automatically
npm run report:json             # Generate JSON report
```

## 🛠️ Maintenance Commands

```bash
npm run clean                   # Clean previous results
npm run setup                   # Complete initial setup
npm run health-check            # Verify everything works
```

## 💡 Usage Recommendations

### For Daily Development ⚡ (Headless)
```bash
# Normal development (super fast)
npm test

# Critical tests only (ultra fast)
npm run test:smoke

# Specific area
npm run test:e2e:auth
```

### For Debug/Troubleshooting 🐛 (With browser)
```bash
# See browser to understand what happens
npm run test:headed

# Step-by-step debug
npm run test:debug

# Specific area with browser
npm run test:e2e:auth:headed
```

### For Pull Requests 🔍 (Headless for speed)
```bash
# Complete verification on main browsers
npm run test:full

# Critical tests on all browsers
npm run test:critical
```

### For Demos/Presentations 📺 (With browser)
```bash
# Show tests running
npm run test:smoke:headed

# Cross-browser demo
npm run test:full:headed
```

### For Releases 🚀 (Headless for speed)
```bash
# Complete cross-browser testing
npm run test:cross-browser

# Or staged testing
npm run test:smoke
npm run test:critical
npm run test:full
```

## 📈 Time Estimates (Optimized for Headless)

| Command | Tests | Browsers | Mode | Approx. Time |
|---------|-------|----------|------|--------------|
| `npm test` | ~200 | Chrome | Headless | 8-12 min |
| `npm run test:headed` | ~200 | Chrome | Visible | 12-18 min |
| `npm run test:smoke` | ~20 | Chrome | Headless | 1-2 min |
| `npm run test:smoke:headed` | ~20 | Chrome | Visible | 2-3 min |
| `npm run test:full` | ~200 | 3 browsers | Headless | 25-35 min |
| `npm run test:full:headed` | ~200 | 3 browsers | Visible | 40-60 min |
| `npm run test:cross-browser` | ~200 | 5 browsers | Headless | 45-70 min |

## 🎯 Advanced Filters

```bash
# Run specific test (headless)
npm test -- tests/e2e/auth/login.spec.ts

# Run specific test (with browser)
npm run test:headed -- tests/e2e/auth/login.spec.ts

# Run by test name
npm test -- --grep "login with valid credentials"

# With visible browser
npm run test:headed -- --grep "login with valid credentials"
```

## 🚨 Troubleshooting

### If a test fails:
```bash
# FIRST: See with visible browser
npm run test:headed -- tests/path/to/failing-test.spec.ts

# SECOND: Step-by-step debug mode
npm run test:debug -- tests/path/to/failing-test.spec.ts
```

### If there are performance issues:
```bash
# Run with less parallelism
npm test -- --workers=1

# Run slow tests with visible browser
npm run test:slow
```

## 🎯 Quick Cheat Sheet

| Need | Quick Command | Time |
|------|---------------|------|
| **Daily development** | `npm test` | 8-12 min |
| **Quick debug** | `npm run test:headed` | 12-18 min |
| **Critical only** | `npm run test:smoke` | 1-2 min |
| **See critical** | `npm run test:smoke:headed` | 2-3 min |
| **Complete testing** | `npm run test:full` | 25-35 min |
| **Demo/presentation** | `npm run test:full:headed` | 40-60 min |

---

## 🎉 Quick Summary

**🔥 By default everything is HEADLESS (fast):**
- `npm test` → Chrome headless (~10 min)
- `npm run test:smoke` → Critical tests headless (~2 min)
- `npm run test:full` → 3 browsers headless (~30 min)

**👁️ Add `:headed` when you need to SEE the browser:**
- `npm run test:headed` → Chrome visible
- `npm run test:smoke:headed` → Critical tests visible
- `npm run test:debug` → Step-by-step debug

Happy Testing! 🧪✨
