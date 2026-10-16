// Разовый прогон: скриншоты error.html + проверка переполнения и битых картинок.
// Запуск: node .claude/verify/error-page-shot.mjs  (требует http.server на :8765 из корня репо)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, '.claude', 'verify', 'screenshots');
mkdirSync(OUT, { recursive: true });

const EXE = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell`;
const VPS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1366', width: 1366, height: 768 },
  { name: '1920', width: 1920, height: 1080 },
];

const browser = await chromium.launch({ executablePath: EXE });
const issues = [];
for (const vp of VPS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const url = 'http://localhost:8765/.template/error.html';
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (response && !response.ok()) issues.push({ vp: vp.name, status: response.status() });
    const r = await page.evaluate(() => {
      const d = document.documentElement;
      const t = document.querySelector('.error-title');
      return {
        overflow: d.scrollWidth > d.clientWidth,
        sw: d.scrollWidth,
        cw: d.clientWidth,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.split('/').pop()),
        title: t ? t.textContent.trim() : null,
      };
    });
    await page.screenshot({ path: path.join(OUT, `error__${vp.name}.png`), fullPage: true });
    if (r.overflow || r.broken.length) issues.push({ vp: vp.name, ...r });
    else console.log(`${vp.name}: ok — «${r.title}», переполнения нет, картинки целые`);
  } catch (e) {
    issues.push({ vp: vp.name, error: e.message.split('\n')[0] });
  }
  await page.close();
}
await browser.close();
console.log('ISSUES:', JSON.stringify(issues, null, 1));
