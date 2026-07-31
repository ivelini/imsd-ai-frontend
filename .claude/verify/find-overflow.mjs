import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
const offenders = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && el.offsetParent !== null) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 80), right: Math.round(r.right), width: Math.round(r.width) });
    }
  }
  return out.slice(0, 15);
});
console.log(JSON.stringify(offenders, null, 2));
await browser.close();
