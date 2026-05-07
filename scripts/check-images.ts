import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE_ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));

  await page.goto('http://localhost:3000/memos', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check how many images are on the page
  const images = page.locator('img');
  const imgCount = await images.count();
  console.log('Images found:', imgCount);
  for (let i = 0; i < imgCount; i++) {
    const src = await images.nth(i).getAttribute('src');
    const naturalWidth = await images.nth(i).evaluate(el => (el as HTMLImageElement).naturalWidth);
    console.log(`  img[${i}] src="${src}" naturalWidth=${naturalWidth}`);
  }

  // Click the first memo to open detail drawer
  const memos = page.locator('button').filter({ hasText: /./ });
  const count = await memos.count();
  console.log('Buttons:', count);

  await page.screenshot({ path: '/tmp/memos-images.png', fullPage: false });
  console.log('Screenshot: /tmp/memos-images.png');

  await browser.close();
})();
