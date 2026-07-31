import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const w of [390, 768, 1366]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:8765/product/index.html', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const params = [...document.querySelectorAll('.parameter-item')].map(li => li.textContent.replace(/\s+/g, ' ').trim());
    const badge = document.querySelector('.payment-option .p-badge');
    const eu = document.querySelector('.gallery .eu-label');
    const img = document.querySelector('.main-image img');
    const euRect = eu.getBoundingClientRect(), imgRect = img.getBoundingClientRect();
    return {
      title: document.querySelector('.details-name').textContent,
      hasRating: !!document.querySelector('.details .rating'),
      paramCount: params.length,
      firstParams: params.slice(0, 3),
      lastParams: params.slice(-2),
      selectOptions: document.querySelectorAll('.quantity-select option').length,
      paymentOptions: document.querySelectorAll('.payment-option').length,
      euInGallery: !!eu,
      euOnImage: Math.abs(imgRect.bottom - euRect.bottom) < 10,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log(w + ':', JSON.stringify(r));
  await page.close();
}
await browser.close();
