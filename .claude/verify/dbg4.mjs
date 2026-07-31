import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const desc = document.querySelector('.model-description');
  const cs = getComputedStyle(desc);
  const kids = [...desc.children].map(el => {
    const r = el.getBoundingClientRect();
    return { cls: el.className, top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width) };
  });
  return { bg: cs.background, shadow: cs.boxShadow, kids };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
