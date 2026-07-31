import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.parameter-item')];
  return items.map(li => li.innerHTML.slice(0, 80));
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
