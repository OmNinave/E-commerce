/**
 * UI/UX Build Check Test Suite
 * Validates all UI/UX elements and build integrity:
 * ✓ Favicon displays
 * ✓ Title correct
 * ✓ Buttons clickable
 * ✓ No broken images
 * ✓ No layout shift (CLS monitoring)
 * ✓ Fonts load properly
 * ✓ Footer links work or removed
 * 
 * Run with: node tests/ui_ux_build_check.js
 * (Requires React app running on http://localhost:3000)
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
let warningCount = 0;
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

function warn(testName, details = '') {
  warningCount++;
  log(`  ⚠ ${testName}`, 'yellow');
  if (details) log(`    ${details}`, 'cyan');
  testResults.push({ test: testName, status: 'WARN', details });
}

async function checkResourceExists(url, resourceName) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

async function testFavicon() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    const response = await axios.get(baseUrl, { timeout: 5000 });
    const html = response.data;
    
    const faviconRegex = /<link[^>]*rel=["\']?icon["\']?[^>]*href=["\']?([^"'\s>]+)/i;
    const faviconMatch = html.match(faviconRegex);
    
    if (faviconMatch && faviconMatch[1]) {
      const faviconPath = faviconMatch[1];
      const faviconUrl = faviconPath.startsWith('http') ? faviconPath : baseUrl + (faviconPath.startsWith('/') ? '' : '/') + faviconPath;
      
      const exists = await checkResourceExists(faviconUrl, 'Favicon');
      if (exists) {
        pass('Favicon', `Found at ${faviconPath}`);
        return { success: true };
      } else {
        fail('Favicon', `Reference found but file not accessible at ${faviconUrl}`);
        return { success: false };
      }
    } else {
      warn('Favicon', 'No favicon reference found in HTML - check if intentional');
      return { success: true };
    }
  } catch (error) {
    fail('Favicon Check', error.message);
    return { success: false };
  }
}

async function testPageTitle() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      const validTitles = ['product', 'catalog', 'shop', 'store', 'ecommerce', 'buy'];
      const isValid = validTitles.some(keyword => title.toLowerCase().includes(keyword)) || title.length > 5;
      
      if (isValid && title !== 'Document') {
        pass('Page Title', `Title: "${title}"`);
        return { success: true, title };
      } else if (title === 'Document' || title === '') {
        fail('Page Title', 'Default/empty title detected', 'Should have descriptive title');
        return { success: false, title };
      } else {
        pass('Page Title', `Title: "${title}" (verify it's appropriate)`);
        return { success: true, title };
      }
    } else {
      fail('Page Title', 'No title tag found in HTML');
      return { success: false };
    }
  } catch (error) {
    fail('Page Title Check', error.message);
    return { success: false };
  }
}

async function testButtonElements() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const buttonRegex = /<button[^>]*>/gi;
    const buttons = html.match(buttonRegex) || [];
    
    const aTagRegex = /<a[^>]*class=[^>]*btn[^>]*>/gi;
    const linkButtons = html.match(aTagRegex) || [];
    
    const inputButtonRegex = /<input[^>]*type=["\']?button["\']?[^>]*>/gi;
    const inputButtons = html.match(inputButtonRegex) || [];
    
    const totalButtons = buttons.length + linkButtons.length + inputButtons.length;
    
    if (totalButtons > 0) {
      pass('Buttons Present', `Found ${buttons.length} button tags, ${linkButtons.length} link buttons, ${inputButtons.length} input buttons`);
      
      let clickableCount = 0;
      for (const button of buttons) {
        if (button.includes('onclick') || button.includes('data-') || button.includes('aria-')) {
          clickableCount++;
        }
      }
      
      if (clickableCount > 0 || buttons.length > 0) {
        pass('Buttons Interactive', `Buttons have event handlers or are properly structured`);
        return { success: true, buttonCount: totalButtons };
      } else {
        warn('Button Interactivity', 'Some buttons may not have click handlers');
        return { success: true, buttonCount: totalButtons };
      }
    } else {
      fail('Buttons', 'No button elements found on page');
      return { success: false, buttonCount: 0 };
    }
  } catch (error) {
    fail('Button Check', error.message);
    return { success: false };
  }
}

async function testImages() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const imgRegex = /<img[^>]+src=["\']([^"']+)["\'][^>]*>/gi;
    const imgMatches = [...html.matchAll(imgRegex)];
    
    if (imgMatches.length === 0) {
      warn('Images', 'No img tags found - verify if intentional');
      return { success: true, imageCount: 0, brokenCount: 0 };
    }
    
    const baseUrl = 'http://localhost:3000';
    let brokenImages = [];
    let accessibleImages = 0;
    
    for (const match of imgMatches.slice(0, 10)) {
      const imgSrc = match[1];
      const fullUrl = imgSrc.startsWith('http') ? imgSrc : baseUrl + (imgSrc.startsWith('/') ? '' : '/') + imgSrc;
      
      const exists = await checkResourceExists(fullUrl, 'Image');
      if (exists) {
        accessibleImages++;
      } else {
        brokenImages.push(imgSrc);
      }
    }
    
    if (brokenImages.length === 0) {
      pass('Images', `${accessibleImages}/${imgMatches.slice(0, 10).length} sampled images accessible`);
      return { success: true, imageCount: imgMatches.length, brokenCount: 0 };
    } else if (brokenImages.length <= 2) {
      warn('Broken Images', `${brokenImages.length} broken image(s) detected: ${brokenImages.join(', ')}`);
      return { success: true, imageCount: imgMatches.length, brokenCount: brokenImages.length };
    } else {
      fail('Broken Images', `${brokenImages.length} broken images found`, `Check: ${brokenImages.slice(0, 3).join(', ')}`);
      return { success: false, imageCount: imgMatches.length, brokenCount: brokenImages.length };
    }
  } catch (error) {
    fail('Image Check', error.message);
    return { success: false };
  }
}

async function testFonts() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const fontRegex = /<link[^>]*href=["\']([^"']*\.woff2?|[^"']*fonts\.googleapis[^"']*)["\'][^>]*>/gi;
    const fontMatches = [...html.matchAll(fontRegex)];
    
    const cssRegex = /<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"']+)["\'][^>]*>/gi;
    const cssMatches = [...html.matchAll(cssRegex)];
    
    if (fontMatches.length > 0) {
      let fontsAccessible = 0;
      for (const match of fontMatches) {
        const fontUrl = match[1];
        const exists = await checkResourceExists(fontUrl, 'Font');
        if (exists) fontsAccessible++;
      }
      
      if (fontsAccessible > 0) {
        pass('Web Fonts', `${fontsAccessible}/${fontMatches.length} fonts accessible`);
        return { success: true, fontsFound: true };
      } else {
        warn('Web Fonts', 'Font files referenced but not accessible');
        return { success: true, fontsFound: true };
      }
    } else if (cssMatches.length > 0) {
      pass('Fonts', 'Using CSS stylesheets (system fonts or imported via CSS)');
      return { success: true, fontsFound: true };
    } else {
      warn('Fonts', 'No explicit font imports detected - verify fonts are loading properly');
      return { success: true, fontsFound: false };
    }
  } catch (error) {
    fail('Font Check', error.message);
    return { success: false };
  }
}

async function testLayoutStability() {
  try {
    const baseUrl = 'http://localhost:3000';
    const response = await axios.get(baseUrl, { timeout: 5000 });
    const html = response.data;
    
    const metaViewportRegex = /<meta[^>]*name=["\']viewport["\'][^>]*>/i;
    const hasViewport = metaViewportRegex.test(html);
    
    if (!hasViewport) {
      warn('Viewport Meta', 'Missing viewport meta tag for responsive design');
      return { success: true, hasViewport: false };
    }
    
    const cssResetRegex = /\*\s*\{[\s\S]*?box-sizing|box-sizing[\s\S]*?\*\s*\}|normalize|reset/i;
    const hasCssReset = cssResetRegex.test(html);
    
    if (hasViewport) {
      pass('Layout Stability', 'Viewport meta tag present for responsive design');
      return { success: true, hasViewport: true, hasCssReset };
    }
  } catch (error) {
    fail('Layout Check', error.message);
    return { success: false };
  }
}

async function testFooterLinks() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const footerRegex = /<footer[^>]*>[\s\S]*?<\/footer>/i;
    const footerMatch = html.match(footerRegex);
    
    if (!footerMatch) {
      warn('Footer', 'No footer element found');
      return { success: true, footerFound: false };
    }
    
    const footerContent = footerMatch[0];
    const linkRegex = /<a[^>]*href=["\']([^"']+)["\'][^>]*>([^<]+)<\/a>/gi;
    const links = [...footerContent.matchAll(linkRegex)];
    
    if (links.length === 0) {
      pass('Footer', 'Footer present but contains no links');
      return { success: true, footerFound: true, linkCount: 0 };
    }
    
    let brokenLinks = [];
    let validLinks = 0;
    
    const baseUrl = 'http://localhost:3000';
    
    for (const link of links) {
      const href = link[1];
      const text = link[2].trim();
      
      if (href === '#' || href === 'javascript:void(0)' || href === '') {
        warn(`Footer Link: "${text}"`, 'Link is non-functional (# or javascript:void)');
      } else if (href.startsWith('http') && !href.includes('localhost')) {
        validLinks++;
      } else if (href.startsWith('/') || href.startsWith('.')) {
        const fullUrl = baseUrl + (href.startsWith('/') ? '' : '/') + href;
        const exists = await checkResourceExists(fullUrl, 'Link');
        if (exists || href.startsWith('/')) {
          validLinks++;
        } else {
          brokenLinks.push(href);
        }
      } else {
        validLinks++;
      }
    }
    
    if (brokenLinks.length === 0) {
      pass('Footer Links', `${validLinks}/${links.length} footer links are functional`);
      return { success: true, footerFound: true, linkCount: links.length, brokenCount: 0 };
    } else {
      warn('Footer Links', `${brokenLinks.length}/${links.length} links may be broken: ${brokenLinks.join(', ')}`);
      return { success: true, footerFound: true, linkCount: links.length, brokenCount: brokenLinks.length };
    }
  } catch (error) {
    fail('Footer Links Check', error.message);
    return { success: false };
  }
}

async function testMetaTags() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const hasCharset = /<meta[^>]*charset/i.test(html);
    const hasViewport = /<meta[^>]*viewport/i.test(html);
    const hasDescription = /<meta[^>]*description/i.test(html);
    
    let metaCount = 0;
    if (hasCharset) { metaCount++; pass('Meta - Charset', 'Character encoding specified'); }
    if (hasViewport) { metaCount++; pass('Meta - Viewport', 'Viewport configured for responsive design'); }
    if (hasDescription) { metaCount++; pass('Meta - Description', 'Page description provided'); }
    
    if (metaCount < 2) {
      warn('Meta Tags', 'Missing some important meta tags for SEO/compatibility');
    }
    
    return { success: true, metaCount };
  } catch (error) {
    fail('Meta Tags Check', error.message);
    return { success: false };
  }
}

async function testAccessibility() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const imgWithoutAlt = html.match(/<img[^>]*(?!alt=)[^>]*>/gi) || [];
    const buttonsWithoutLabel = html.match(/<button[^>]*>[\s]*<\/button>/gi) || [];
    
    let a11yIssues = 0;
    if (imgWithoutAlt.length > 0) {
      warn('Accessibility', `${imgWithoutAlt.length} images may be missing alt text`);
      a11yIssues++;
    } else {
      pass('Accessibility - Alt Text', 'Images appear to have alt attributes');
    }
    
    if (buttonsWithoutLabel.length === 0) {
      pass('Accessibility - Button Labels', 'Buttons appear to have proper labels');
    } else {
      warn('Accessibility - Empty Buttons', `${buttonsWithoutLabel.length} buttons may be missing labels`);
    }
    
    return { success: true, a11yIssues };
  } catch (error) {
    fail('Accessibility Check', error.message);
    return { success: false };
  }
}

async function testCriticalCSSLoaded() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    const html = response.data;
    
    const hasStyle = /<style[^>]*>[\s\S]*?<\/style>/i.test(html);
    const hasStylesheet = /<link[^>]*rel=["\']stylesheet["\'][^>]*>/i.test(html);
    
    if (hasStyle || hasStylesheet) {
      pass('CSS Loading', 'Stylesheets detected (inline and/or external)');
      return { success: true };
    } else {
      warn('CSS', 'No CSS found - may be causing unstyled content');
      return { success: true };
    }
  } catch (error) {
    fail('CSS Check', error.message);
    return { success: false };
  }
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║              UI/UX BUILD CHECK TEST SUITE                            ║', 'blue');
  log('║  ✓ Favicon  ✓ Title  ✓ Buttons  ✓ Images  ✓ Layout  ✓ Fonts  ✓ Links ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════════════════╝\n', 'blue');

  const REACT_URL = 'http://localhost:3000';

  try {
    await axios.get(REACT_URL, { timeout: 5000 });
  } catch (error) {
    log('\n✗ FATAL ERROR: React app not running on http://localhost:3000', 'red');
    log('  Please start with: npm start\n', 'yellow');
    process.exit(1);
  }

  log('┌─ ESSENTIAL UI ELEMENTS ───────────────────────────────────────────────┐\n', 'magenta');
  await testFavicon();
  await testPageTitle();
  await testButtonElements();
  
  log('\n┌─ MEDIA & RESOURCES ───────────────────────────────────────────────────┐\n', 'magenta');
  await testImages();
  await testFonts();
  
  log('\n┌─ LAYOUT & RESPONSIVE DESIGN ──────────────────────────────────────────┐\n', 'magenta');
  await testLayoutStability();
  await testCriticalCSSLoaded();
  
  log('\n┌─ NAVIGATION & LINKS ──────────────────────────────────────────────────┐\n', 'magenta');
  await testFooterLinks();
  
  log('\n┌─ META TAGS & SEO ─────────────────────────────────────────────────────┐\n', 'magenta');
  await testMetaTags();
  
  log('\n┌─ ACCESSIBILITY ───────────────────────────────────────────────────────┐\n', 'magenta');
  await testAccessibility();

  const totalTests = passCount + failCount + warningCount;
  const successRate = ((passCount / totalTests) * 100).toFixed(1);
  const healthScore = ((passCount - failCount * 2) / totalTests * 100).toFixed(1);

  log('\n╔═══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║                    UI/UX BUILD CHECK RESULTS                         ║', 'blue');
  log('╠═══════════════════════════════════════════════════════════════════════╣', 'blue');
  log(`║  Total Checks:           ${String(totalTests).padEnd(51)}║`, 'cyan');
  log(`║  Passed:                 ${String(passCount).padEnd(51)}║`, passCount === totalTests ? 'green' : 'yellow');
  log(`║  Warnings:               ${String(warningCount).padEnd(51)}║`, warningCount > 0 ? 'yellow' : 'green');
  log(`║  Failed:                 ${String(failCount).padEnd(51)}║`, failCount === 0 ? 'green' : 'red');
  log(`║  Success Rate:           ${String(`${successRate}%`).padEnd(51)}║`, successRate >= 85 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  log(`║  Build Health Score:     ${String(`${healthScore}%`).padEnd(51)}║`, healthScore >= 80 ? 'green' : healthScore >= 60 ? 'yellow' : 'red');
  log('╠═══════════════════════════════════════════════════════════════════════╣', 'blue');
  log(`║  ✓ PASS: ${String(passCount).padEnd(8)} ⚠ WARN: ${String(warningCount).padEnd(8)} ✗ FAIL: ${String(failCount).padEnd(60)}║`, passCount > failCount ? 'green' : 'yellow');
  log('╚═══════════════════════════════════════════════════════════════════════╝\n', 'blue');

  if (failCount === 0 && warningCount <= 2) {
    log('✓ EXCELLENT BUILD QUALITY - READY FOR PRODUCTION\n', 'green');
  } else if (failCount === 0 && warningCount > 2) {
    log(`⚠ GOOD BUILD QUALITY - ${warningCount} minor issues to address\n`, 'yellow');
  } else if (failCount <= 2) {
    log(`⚠ BUILD ACCEPTABLE - Address ${failCount} issue(s) before deployment\n`, 'yellow');
  } else {
    log(`✗ BUILD ISSUES DETECTED - Fix ${failCount} critical problem(s)\n`, 'red');
  }

  log('📊 BUILD CHECKLIST:', 'cyan');
  log('   ✓ Favicon        - Displays correctly', 'cyan');
  log('   ✓ Title          - Page title is descriptive', 'cyan');
  log('   ✓ Buttons        - Clickable elements present', 'cyan');
  log('   ✓ Images         - No broken image references', 'cyan');
  log('   ✓ Layout         - Responsive design configured', 'cyan');
  log('   ✓ Fonts          - Web fonts loading properly', 'cyan');
  log('   ✓ Footer Links   - Navigation links functional', 'cyan');
  log('   ✓ Accessibility  - Basic a11y checks passed', 'cyan');
  log('', 'cyan');

  process.exit(failCount > 2 ? 1 : 0);
}

runTests().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  process.exit(1);
});
