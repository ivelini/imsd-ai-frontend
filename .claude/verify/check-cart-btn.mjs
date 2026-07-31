import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 640, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const btn = document.querySelector('.add-to-cart-button');
    const cs = getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    const vh = window.innerHeight;
    return {
      position: cs.position,
      pinnedToBottom: Math.abs(rect.bottom - vh) <= 1,
      fullWidth: Math.abs(rect.width - document.documentElement.clientWidth) <= 1,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
