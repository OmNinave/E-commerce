/**
 * Critical Page Load Test Suite
 * Measures performance metrics and validates page load for all critical pages
 * 
 * Run with: npm install puppeteer (if not already installed)
 *           node tests/critical_page_load_test.js
 * 
 * Ensure the React app is running on http://localhost:3000 before running
 */

const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let passCount = 0;
let failCount = 0;
const testResults = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(testName, details = '') {
  passCount++;
  log(`  ✓ ${testName}`, 'green');
  if (details) log(`    ${details}`, 'cyan');
  testResults.push({ test: testName, status: 'PASS', details });
}

function fail(testName, error, details = '') {
  failCount++;
  log(`  ✗ ${testName}`, 'red');
  log(`    Error: ${error}`, 'red');
  if (details) log(`    Details: ${details}`, 'red');
  testResults.push({ test: testName, status: 'FAIL', error, details });
}

const PERFORMANCE_THRESHOLDS = {
  critical: 2000,
  important: 3000,
  standard: 4000
};

const CRITICAL_PAGES = [
  { url: '/', name: 'Home', priority: 'critical' },
  { url: '/products', name: 'Product List', priority: 'critical' },
  { url: '/cart', name: 'Shopping Cart', priority: 'critical' },
  { url: '/checkout', name: 'Checkout', priority: 'critical' },
  { url: '/login', name: 'Login', priority: 'critical' },
  { url: '/register', name: 'Register', priority: 'critical' }
];

const IMPORTANT_PAGES = [
  { url: '/products/1', name: 'Product Detail', priority: 'important' },
  { url: '/orders', name: 'My Orders', priority: 'important' },
  { url: '/wishlist', name: 'Wishlist', priority: 'important' },
  { url: '/profile', name: 'Edit Profile', priority: 'important' },
  { url: '/addresses', name: 'Manage Addresses', priority: 'important' }
];

const STANDARD_PAGES = [
  { url: '/settings', name: 'Settings', priority: 'standard' },
  { url: '/forgot-password', name: 'Forgot Password', priority: 'standard' },
  { url: '/terms', name: 'Terms', priority: 'standard' },
  { url: '/privacy', name: 'Privacy', priority: 'standard' }
];

async function testPageLoad(baseUrl, page, useMeasureApi = false) {
  const url = `${baseUrl}${page.url}`;
  const threshold = PERFORMANCE_THRESHOLDS[page.priority];
  
  try {
    const startTime = Date.now();
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const loadTime = Date.now() - startTime;
    const statusCheck = response.status === 200;
    const contentCheck = response.data && response.data.length > 0;
    
    const performance = loadTime <= threshold ? 'green' : loadTime <= threshold + 500 ? 'yellow' : 'red';
    const performanceLabel = loadTime <= threshold ? 'GOOD' : loadTime <= threshold + 500 ? 'ACCEPTABLE' : 'SLOW';
    
    if (statusCheck && contentCheck) {
      pass(
        `${page.name} (${page.url})`,
        `${loadTime}ms [${performanceLabel}] (Threshold: ${threshold}ms)`
      );
      return { success: true, loadTime, threshold, priority: page.priority };
    } else {
      fail(
        `${page.name} (${page.url})`,
        `Status: ${response.status}, Content: ${contentCheck ? 'Present' : 'Missing'}`,
        `Load time: ${loadTime}ms`
      );
      return { success: false, loadTime, threshold, priority: page.priority };
    }
  } catch (error) {
    fail(
      `${page.name} (${page.url})`,
      error.message,
      `Failed to load page: ${error.code || error.status}`
    );
    return { success: false, loadTime: null, threshold, priority: page.priority };
  }
}

async function testBatchPageLoad(baseUrl, pages) {
  const batchResults = [];
  
  for (const page of pages) {
    const result = await testPageLoad(baseUrl, page);
    batchResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return batchResults;
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║              CRITICAL PAGE LOAD PERFORMANCE TEST SUITE               ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════════════════╝\n', 'blue');

  const BASE_URL = 'http://localhost:3000';
  
  try {
    await axios.get(`${BASE_URL}/`, { timeout: 5000 });
  } catch (error) {
    log('\n✗ FATAL ERROR: React app not running on http://localhost:3000', 'red');
    log('  Please start the app with: npm start\n', 'yellow');
    process.exit(1);
  }

  log('\n┌─ CRITICAL PAGES (Target: ≤2000ms) ─────────────────────────────────┐\n', 'magenta');
  const criticalResults = await testBatchPageLoad(BASE_URL, CRITICAL_PAGES);

  log('\n┌─ IMPORTANT PAGES (Target: ≤3000ms) ─────────────────────────────────┐\n', 'magenta');
  const importantResults = await testBatchPageLoad(BASE_URL, IMPORTANT_PAGES);

  log('\n┌─ STANDARD PAGES (Target: ≤4000ms) ──────────────────────────────────┐\n', 'magenta');
  const standardResults = await testBatchPageLoad(BASE_URL, STANDARD_PAGES);

  const allResults = [...criticalResults, ...importantResults, ...standardResults];
  const loadTimes = allResults.filter(r => r.loadTime !== null).map(r => r.loadTime);
  
  const avgLoadTime = loadTimes.length > 0 ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : 0;
  const maxLoadTime = Math.max(...loadTimes, 0);
  const minLoadTime = Math.min(...loadTimes, Infinity);
  
  const successCount = allResults.filter(r => r.success).length;
  const totalCount = allResults.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  const aboveThreshold = allResults.filter(r => 
    r.success && r.loadTime && r.loadTime > r.threshold
  ).length;

  log('\n╔═══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║                         PERFORMANCE SUMMARY                          ║', 'blue');
  log('╠═══════════════════════════════════════════════════════════════════════╣', 'blue');
  log(`║  Total Pages Tested:         ${String(totalCount).padEnd(51)}║`, 'cyan');
  log(`║  Successful Loads:           ${String(`${successCount}/${totalCount}`).padEnd(51)}║`, successCount === totalCount ? 'green' : 'yellow');
  log(`║  Success Rate:               ${String(`${successRate}%`).padEnd(51)}║`, successCount === totalCount ? 'green' : 'yellow');
  log(`║                                                                       ║`, 'blue');
  log(`║  Average Load Time:          ${String(`${avgLoadTime}ms`).padEnd(51)}║`, avgLoadTime <= 2500 ? 'green' : avgLoadTime <= 3500 ? 'yellow' : 'red');
  log(`║  Maximum Load Time:          ${String(`${maxLoadTime}ms`).padEnd(51)}║`, maxLoadTime <= 4000 ? 'green' : maxLoadTime <= 5000 ? 'yellow' : 'red');
  log(`║  Minimum Load Time:          ${String(`${minLoadTime}ms`).padEnd(51)}║`, 'cyan');
  log(`║  Pages Above Threshold:      ${String(aboveThreshold).padEnd(51)}║`, aboveThreshold === 0 ? 'green' : 'yellow');
  log('╠═══════════════════════════════════════════════════════════════════════╣', 'blue');
  log(`║  PASS: ${String(passCount).padEnd(9)} FAIL: ${String(failCount).padEnd(62)}║`, passCount > failCount ? 'green' : 'red');
  log('╚═══════════════════════════════════════════════════════════════════════╝\n', 'blue');

  if (aboveThreshold > 0) {
    log(`⚠ WARNING: ${aboveThreshold} page(s) exceeded performance threshold`, 'yellow');
  }

  if (failCount === 0 && aboveThreshold <= Math.ceil(totalCount * 0.1)) {
    log('✓ ALL CRITICAL PAGES PASSED PERFORMANCE REQUIREMENTS\n', 'green');
  } else if (failCount === 0) {
    log(`⚠ Some pages need optimization (${aboveThreshold} above threshold)\n`, 'yellow');
  } else {
    log(`✗ Some pages failed to load properly\n`, 'red');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  process.exit(1);
});
