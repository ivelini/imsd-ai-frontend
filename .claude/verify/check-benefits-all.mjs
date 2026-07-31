import { chromium } from 'playwright';
const browser = await chromium.launch();
const pages = ['/index.html', '/catalog/index.html', '/catalog/filter-params.html', '/catalog/filter-car.html', '/catalog/filter-applied.html', '/catalog/filter-mobile.html', '/product/index.html', '/cart/index.html', '/order/index.html', '/popups/cart.html', '/popups/catalog-menu.html', '/popups/geo.html'];
let bad = 0;
for (const w of [390, 768, 1366]) {
  for (const path of pages) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const b = document.querySelector('.benefits');
      if (!b) return { found: false };
      const h = document.querySelector('header');
      const br = b.getBoundingClientRect();
      return {
        found: true,
        count: b.querySelectorAll('a.benefit').length,
        afterHeader: h ? br.top >= h.getBoundingClientRect().bottom : true,
        texts: [...b.querySelectorAll('a.benefit span')].map(s => s.textContent),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    const ok = r.found && r.count === 3 && r.afterHeader && !r.overflow;
    if (!ok) { console.log(w + path, JSON.stringify(r)); bad++; }
    await page.close();
  }
}
console.log('bad:', bad);
await browser.close();
