import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const b = document.querySelector('.benefits');
  const el = b.querySelector('.benefit');
  const cs = getComputedStyle(el);
  const bs = getComputedStyle(b);
  const matched = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText && rule.selectorText.includes('.benefit')) matched.push(rule.cssText);
      }
    } catch {}
  }
  return {
    benefit: { display: cs.display, width: cs.width, justifyContent: cs.justifyContent, boxSizing: cs.boxSizing },
    benefits: { display: bs.display, direction: bs.flexDirection, width: bs.width, padding: bs.padding },
    rect: { b: Math.round(b.getBoundingClientRect().width), el: Math.round(el.getBoundingClientRect().width) },
    rules: matched,
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
