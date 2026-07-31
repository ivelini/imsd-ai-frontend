import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const pag = document.querySelector('.pagination');
    if (!pag) return { found: false };
    const seo = document.querySelector('.seo-content');
    const section = document.querySelector('.catalog-section');
    const pr = pag.getBoundingClientRect(), sr = section.getBoundingClientRect(), er = seo.getBoundingClientRect();
    return {
      found: true,
      links: pag.querySelectorAll('.pagination-link').length,
      active: pag.querySelector('.pagination-link_active')?.textContent,
      dots: pag.querySelectorAll('.pagination-dots').length,
      next: !!pag.querySelector('.pagination-next'),
      afterList: pr.top >= sr.bottom,
      beforeSeo: er.top >= pr.bottom,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
