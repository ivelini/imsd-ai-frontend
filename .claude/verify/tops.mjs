import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const [name, path, vp] of [
  ['index', '/index.html', { width: 1366, height: 768 }],
  ['index-mob', '/index.html', { width: 390, height: 844 }],
  ['catalog', '/catalog/index.html', { width: 1366, height: 768 }],
  ['product', '/product/index.html', { width: 390, height: 844 }],
  ['cart', '/cart/index.html', { width: 390, height: 844 }],
  ['order', '/order/index.html', { width: 1366, height: 768 }],
]) {
  const page = await browser.newPage({ viewport: vp });
  await page.goto(`http://localhost:8765${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `.claude/verify/screenshots/top_${name}.png` });
  await page.close();
}
await browser.close();
console.log('done');
