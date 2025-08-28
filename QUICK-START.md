# ⚡ Quick Setup - Testing Configuration

## 🎯 What you need to know:

### Main Command (Recommended for daily use)
```bash
npm test
```
**✅ This runs ONLY on Chrome in headless mode (~200 tests in 10-15 minutes)**

### See browser while running (when you need debug)
```bash
npm run test:headed        # See Chrome while running
npm run test:debug         # Step-by-step debug mode
npm run test:ui            # Playwright UI interface
```

### Deep Testing (For important verifications)
```bash
npm run test:full          # Chrome + Firefox + Safari (headless, ~45 minutes)
npm run test:cross-browser # All browsers including mobile (headless, ~90 minutes)
npm run test:full:headed   # Same but with visible browsers
```

### Quick Tests by Area
```bash
npm run test:smoke         # Critical tests only (headless, ~3 minutes)
npm run test:smoke:headed  # Same but seeing the browser
npm run test:e2e:auth      # Authentication only (headless)
npm run test:e2e:auth:headed # Authentication only (with visible browser)
npm run test:e2e:ecommerce # E-commerce only (headless)
```

## 🛠️ Initial Setup (Only the first time)
```bash
npm run setup              # Installs everything needed
npm run health-check       # Verifies everything works
```

## 🚀 First Steps
1. **Normal development:** `npm test` (headless, fast)
2. **See what happens:** `npm run test:headed` (with visible browser)
3. **Debug:** `npm run test:debug` (step by step)
4. **Quick tests:** `npm run test:smoke` (headless, critical)

## 📊 View Results
```bash
npm run report             # Opens HTML report
```

## 💡 Headless vs Headed Mode

**🔥 By default: EVERYTHING is headless (no visible browser)**
- ✅ Faster
- ✅ Less resources
- ✅ Ideal for daily development

**👁️ When to add `:headed` to command:**
- 🐛 For debug/troubleshooting
- 📺 For demos or presentations
- 🔍 To understand what's happening

---
**💡 Tip:** Use normal commands for speed, add `:headed` only when you need to see the browser.
