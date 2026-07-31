import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
const offenders = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && el.offsetParent !== null) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), right: Math.round(r.right), w: Math.round(r.width), text: (el.textContent || '').trim().slice(0, 40) });
    }
  }
  return out.slice(0, 12);
});
console.log(JSON.stringify(offenders, null, 1));
await browser.close();
