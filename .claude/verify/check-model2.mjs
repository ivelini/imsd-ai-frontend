import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/catalog/model.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const img = document.querySelector('.model-description-image img');
    const nav = document.querySelectorAll('.model-sizes-nav a');
    const groups = [...document.querySelectorAll('.model-diameter')].map(g => ({
      title: g.querySelector('.model-diameter-title').textContent,
      cards: g.querySelectorAll('.catalog-product').length,
    }));
    // проверка якорей
    const anchorsOk = [...nav].every(a => !!document.querySelector(a.getAttribute('href')));
    return {
      hasImage: !!img && img.naturalWidth > 0,
      imageW: img ? Math.round(img.getBoundingClientRect().width) : 0,
      navCount: nav.length,
      anchorsOk,
      groups,
      totalCards: document.querySelectorAll('.catalog-product').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
