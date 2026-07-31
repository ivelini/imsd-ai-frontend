import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const pag = document.querySelector('.pagination');
    const pr = pag.getBoundingClientRect();
    const parent = pag.parentElement.getBoundingClientRect();
    const center = pr.left + pr.width / 2;
    const parentCenter = parent.left + parent.width / 2;
    return { centered: Math.abs(center - parentCenter) < 4, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
