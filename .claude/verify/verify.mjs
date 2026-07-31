// Верификация мокапа: скриншоты + проверка горизонтального переполнения
// Запуск: node .claude/verify/verify.mjs  (требует http.server на :8765)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, '.claude', 'verify', 'screenshots');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1366', width: 1366, height: 768 },
  { name: '1920', width: 1920, height: 1080 },
];

const PAGES = [
  ['index', '/.template/index.html'],
  ['catalog-index', '/.template/catalog/index.html'],
  ['catalog-filter-params', '/.template/catalog/filter-params.html'],
  ['catalog-filter-car', '/.template/catalog/filter-car.html'],
  ['catalog-filter-applied', '/.template/catalog/filter-applied.html'],
  ['catalog-filter-mobile', '/.template/catalog/filter-mobile.html'],
  ['product', '/.template/product/index.html'],
  ['cart', '/.template/cart/index.html'],
  ['order', '/.template/order/index.html'],
  ['user-login', '/.template/user/login.html'],
  ['article', '/.template/article/index.html'],
  ['article-view', '/.template/article/view.html'],
  ['user-register', '/.template/user/register.html'],
  ['popup-cart', '/.template/popups/cart.html'],
  ['popup-catalog-menu', '/.template/popups/catalog-menu.html'],
  ['popup-geo', '/.template/popups/geo.html'],
];

const browser = await chromium.launch();
const issues = [];

for (const [pageName, pagePath] of PAGES) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const url = `http://localhost:8765${pagePath}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const report = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          overflowX: doc.scrollWidth > doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          images: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
          consoleErrors: window.__verifyErrors || [],
        };
      });
      await page.screenshot({ path: path.join(OUT, `${pageName}__${vp.name}.png`), fullPage: true });
      if (report.overflowX || report.images.length) {
        issues.push({
          page: pageName,
          vp: vp.name,
          overflowX: report.overflowX,
          scrollWidth: report.scrollWidth,
          clientWidth: report.clientWidth,
          brokenImages: report.images,
        });
      }
    } catch (e) {
      issues.push({ page: pageName, vp: vp.name, error: e.message.split('\n')[0] });
    }
    await page.close();
  }
}

await browser.close();
console.log('ISSUES:', JSON.stringify(issues, null, 2));
console.log(`\nDone. Screenshots in ${OUT}`);
