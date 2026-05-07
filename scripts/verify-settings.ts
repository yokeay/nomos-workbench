import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  // Check sidebar content for Settings
  const sidebarContent = await page.locator('aside').first().textContent();
  console.log('Sidebar contains "设置":', sidebarContent?.includes('设置'));

  // Check sidebar nav buttons
  const navButtons = page.locator('aside').first().locator('nav button');
  const count = await navButtons.count();
  console.log('Sidebar nav buttons:', count);
  for (let i = 0; i < count; i++) {
    const title = await navButtons.nth(i).getAttribute('title');
    console.log(`  [${i}] title="${title}"`);
  }

  // Navigate to settings page
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check for DUFS auth key elements in the page HTML
  const html = await page.content();
  console.log('HTML contains "认证密钥":', html.includes('认证密钥'));
  console.log('HTML contains "Auth Key":', html.includes('Auth Key'));
  console.log('HTML contains storageDufsAuthKey:', html.includes('storageDufsAuthKey'));

  // Check storage provider buttons exist
  const dufsBtn = page.locator('button').filter({ hasText: 'DUFS' });
  console.log('DUFS button exists:', (await dufsBtn.count()) > 0);
  console.log('DUFS button disabled:', await dufsBtn.isDisabled());

  // Check server URL input (visible when dufs is selected)
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  console.log('Total inputs on page:', inputCount);
  for (let i = 0; i < inputCount; i++) {
    const placeholder = await inputs.nth(i).getAttribute('placeholder');
    const type = await inputs.nth(i).getAttribute('type');
    if (placeholder) console.log(`  input[${i}] type="${type}" placeholder="${placeholder}"`);
  }

  await page.screenshot({ path: '/tmp/settings-dufs.png', fullPage: false });
  console.log('Screenshot: /tmp/settings-dufs.png');

  await browser.close();
})();
