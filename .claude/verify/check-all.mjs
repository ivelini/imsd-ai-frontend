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
// Домен booking: страницы шиномонтажа (11 шт.)
const BOOKING_PAGES = [
  '/.template/booking/index.html', '/.template/booking/services.html', '/.template/booking/details.html',
  '/.template/booking/code.html', '/.template/booking/success.html', '/.template/booking/code-expired.html',
  '/.template/booking/unavailable.html', '/.template/booking/my/index.html', '/.template/booking/my/code.html',
  '/.template/booking/my/list.html', '/.template/booking/my/cancelled.html',
];
PAGES.push(...BOOKING_PAGES);
const issues = [];
for (const path of PAGES) {
  for (const [w, h] of VPS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    try {
      const response = await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      if (response && !response.ok()) issues.push({ path, vp: `${w}x${h}`, status: response.status() });
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
// Ссылки страниц booking: каждая внутренняя ссылка должна вести на существующий файл
const linkIssues = [];
for (const path of BOOKING_PAGES) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  try {
    await page.goto(`http://localhost:8765${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const bad = await page.evaluate(async () => {
      const hrefs = [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && !h.startsWith('#') && !h.startsWith('http') && !h.startsWith('tel:') && !h.startsWith('mailto:'));
      const missing = [];
      for (const href of [...new Set(hrefs)]) {
        const url = new URL(href, location.href).href;
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (!res.ok) missing.push(`${href} → ${res.status}`);
        } catch (e) {
          missing.push(`${href} → ${e.message}`);
        }
      }
      return missing;
    });
    if (bad.length) linkIssues.push({ path, broken: bad });
  } catch (e) {
    linkIssues.push({ path, error: e.message.split('\n')[0] });
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(issues, null, 1));
console.log('ISSUES:', issues.length);
console.log('LINKS:', JSON.stringify(linkIssues, null, 1));
console.log('LINK_ISSUES:', linkIssues.length);
