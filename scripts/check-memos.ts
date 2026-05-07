import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
  
  await page.goto('http://localhost:3000/memos', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const body = await page.textContent('body');
  console.log('Page body preview:', body?.slice(0, 800));
  
  await page.screenshot({ path: '/tmp/memos-error.png', fullPage: false });
  console.log('Screenshot: /tmp/memos-error.png');
  
  await browser.close();
})();
