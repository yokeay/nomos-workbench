import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Click weather button
  const weatherBtn = page.locator('button').filter({ hasText: /°/ }).first();
  console.log('Clicking weather:', (await weatherBtn.textContent())?.trim());
  await weatherBtn.click();
  await page.waitForTimeout(1000);

  // Check popup styles
  const weatherPopup = page.locator('[class*="bg-popover/80"][class*="backdrop-blur-xl"]').first();
  const cs = await weatherPopup.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      backdropFilter: s.backdropFilter,
    };
  });
  console.log('Weather popup:', JSON.stringify(cs));

  // Check BenDiBackdrop overlay
  const wBackdrop = page.locator('.backdrop-blur-sm.bg-background\\/10').first();
  const wbCount = await wBackdrop.count();
  console.log('BenDiBackdrop layers (weather open):', wbCount);
  if (wbCount > 0) {
    const bcs = await wBackdrop.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        position: s.position,
        backdropFilter: s.backdropFilter,
        backgroundColor: s.backgroundColor,
        zIndex: s.zIndex,
        pointerEvents: s.pointerEvents,
      };
    });
    console.log('BenDiBackdrop:', JSON.stringify(bcs));
  }

  // Close weather
  await page.locator('body').click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(500);

  // Check BenDiBackdrop disappears
  const wbAfter = await wBackdrop.count();
  console.log('BenDiBackdrop after close:', wbAfter);

  // Click time button
  const timeBtn = page.locator('button').filter({ hasText: /\d{4}年/ }).first();
  console.log('Clicking time:', (await timeBtn.textContent())?.trim());
  await timeBtn.click();
  await page.waitForTimeout(1000);

  const timePopup = page.locator('[class*="bg-popover/80"][class*="backdrop-blur-xl"]').first();
  const tcs = await timePopup.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      backdropFilter: s.backdropFilter,
    };
  });
  console.log('Time popup:', JSON.stringify(tcs));

  // Both open at once: open weather while time is open
  await weatherBtn.click();
  await page.waitForTimeout(1000);

  const allPopups = page.locator('[class*="bg-popover/80"][class*="backdrop-blur-xl"]');
  const allBackdrops = page.locator('.backdrop-blur-sm.bg-background\\/10');
  console.log('Both open - popups:', await allPopups.count(), 'backdrops:', await allBackdrops.count());

  await page.screenshot({ path: '/tmp/popup-final.png', fullPage: false });
  console.log('Screenshot saved to /tmp/popup-final.png');

  await browser.close();
})();
