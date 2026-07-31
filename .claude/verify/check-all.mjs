import { chromium } from 'playwright';
const browser = await chromium.launch();
const VPS = [
  [390, 844], [768, 1024], [1024, 768], [1366, 768], [1920, 1080],
];
const PAGES = [
  '/.template/index.html', '/.template/catalog/index.html', '/.template/catalog/filter-params.html', '/.template/catalog/filter-car.html',
  '/.template/catalog/filter-applied.html', '/.template/catalog/filter-mobile.html', '/.template/product/index.html',
  '/.template/cart/index.html', '/.template/order/index.html', '/.template/user/login.html', '/.template/user/register.html', '/.template/article/index.html', '/.template/article/view.html', '/.template/popups/cart.html', '/.template/popups/catalog-menu.html', '/.template/popups/geo.html',
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
