import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));

  // Login first
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  
  // Try credentials login
  const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"], input[placeholder*="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  
  if (await emailInput.count() > 0) {
    await emailInput.fill('admin@nomos.com');
    await passwordInput.fill('admin123');
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /登录|登入|Login|Sign in/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // Go to memos page
  await page.goto('http://localhost:3000/memos', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  const bodyText = await page.textContent('body');
  console.log('Login gate visible:', bodyText?.includes('请先登录'));

  // Check images
  const images = page.locator('img');
  const imgCount = await images.count();
  console.log('Images found:', imgCount);
  for (let i = 0; i < imgCount; i++) {
    const src = await images.nth(i).getAttribute('src');
    const naturalWidth = await images.nth(i).evaluate(el => (el as HTMLImageElement).naturalWidth);
    console.log(`  img[${i}] src="${src?.slice(0, 100)}" naturalWidth=${naturalWidth}`);
  }

  await page.screenshot({ path: '/tmp/memos-full.png', fullPage: false });
  console.log('Screenshot: /tmp/memos-full.png');

  await browser.close();
})();
