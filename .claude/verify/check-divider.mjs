import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('.model-diameter')];
    return groups.map(g => ({
      title: g.querySelector('.model-diameter-title').textContent,
      borderTop: getComputedStyle(g).borderTopWidth,
    }));
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
