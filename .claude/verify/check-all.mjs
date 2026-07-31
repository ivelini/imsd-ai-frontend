import { chromium } from 'playwright';
const browser = await chromium.launch();
const VPS = [
  [390, 844], [768, 1024], [1024, 768], [1366, 768], [1920, 1080],
];
const PAGES = [
  '/index.html', '/catalog/index.html', '/catalog/filter-params.html', '/catalog/filter-car.html',
  '/catalog/filter-applied.html', '/catalog/filter-mobile.html', '/product/index.html',
  '/cart/index.html', '/order/index.html', '/popups/cart.html', '/popups/catalog-menu.html', '/popups/geo.html',
];
const issues = [];
for (const path of PAGES) {
  for (const [w, h] of VPS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    try {
      await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      const r = await page.evaluate(() => {
        const d = document.documentElement;
        return {
          overflow: d.scrollWidth > d.clientWidth,
          sw: d.scrollWidth, cw: d.clientWidth,
          broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.split('/').pop()),
        };
      });
      if (r.overflow || r.broken.length) issues.push({ path, vp: `${w}x${h}`, ...r });
    } catch (e) { issues.push({ path, vp: `${w}x${h}`, error: e.message.split('\n')[0] }); }
    await page.close();
  }
}
await browser.close();
console.log(JSON.stringify(issues, null, 1));
console.log('ISSUES:', issues.length);
