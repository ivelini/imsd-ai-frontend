import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const seo = document.querySelector('.seo-content');
    if (!seo) return { found: false };
    const section = document.querySelector('.catalog-section');
    const footer = document.querySelector('footer');
    const sr = section.getBoundingClientRect(), er = seo.getBoundingClientRect(), fr = footer.getBoundingClientRect();
    return {
      found: true,
      title: seo.querySelector('.seo-content-title').textContent,
      subtitles: seo.querySelectorAll('.seo-content-subtitle').length,
      lists: seo.querySelectorAll('.seo-content-list').length,
      sizes: seo.querySelectorAll('.seo-content-sizes a').length,
      afterList: er.top >= sr.bottom,
      beforeFooter: er.bottom <= fr.top,
      aligned: Math.abs(er.left - sr.left) < 2,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
