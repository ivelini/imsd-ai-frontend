import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/auto.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const m = document.querySelector('.auto-models');
    const links = [...m.querySelectorAll('.auto-models-list a')];
    const first = links[0];
    const cs = getComputedStyle(m), ls = getComputedStyle(first);
    return {
      panel: { bg: cs.backgroundColor, shadow: cs.boxShadow !== 'none', radius: cs.borderRadius, pad: cs.padding },
      chip: { border: ls.borderTopWidth + ' ' + ls.borderTopStyle, radius: ls.borderRadius, pad: ls.padding },
      count: links.length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
