import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 768, height: 900 } });
await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const card = document.querySelector('.model-diameter .catalog-product');
  const title = card.querySelector('.catalog-product-title');
  const info = card.querySelector('.catalog-product-info');
  const cs = getComputedStyle(title), is = getComputedStyle(info);
  const tr = title.getBoundingClientRect(), ir = info.getBoundingClientRect();
  const prices = card.querySelector('.catalog-product-prices').getBoundingClientRect();
  return {
    title: { flex: cs.flex, maxW: cs.maxWidth, w: Math.round(tr.width), text: title.textContent.trim().slice(0, 40) },
    info: { display: is.display, direction: is.flexDirection, w: Math.round(ir.width) },
    prices: { left: Math.round(prices.left), w: Math.round(prices.width) },
    cardW: Math.round(card.getBoundingClientRect().width),
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
