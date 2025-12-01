const puppeteer = require('puppeteer');
const path = require('path');

const outputDir = 'a:\\Coding Space\\workspace\\Internship\\project\\ecomerce\\DOCS\\REPORT\\images';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const capture = async (url, filename) => {
        console.log(`Navigating to ${url}...`);
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            const outputPath = path.join(outputDir, filename);
            await page.screenshot({ path: outputPath });
            console.log(`Saved ${filename}`);
        } catch (e) {
            console.error(`Failed to capture ${url}:`, e.message);
        }
    };

    await capture('http://localhost:3000', 'homepage_view.png');
    await capture('http://localhost:3000/products', 'product_listing.png');
    // Try to find a product link if direct navigation fails, or just guess ID 1
    await capture('http://localhost:3000/product/1', 'product_detail.png');
    await capture('http://localhost:3000/cart', 'shopping_cart.png');
    await capture('http://localhost:3000/login', 'login_page.png');
    await capture('http://localhost:3000/admin', 'admin_dashboard.png');

    await browser.close();
    console.log('Done.');
})();
