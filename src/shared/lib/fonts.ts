/**
 * Файлы шрифтов для предзагрузки. URL обязаны совпадать с `src` в `@font-face`
 * (`src/app/style.css`) — иначе браузер скачает файл дважды; страж-тест
 * `tests/unit/fontPreload.test.ts`.
 */
export const FONT_PRELOAD_URLS: readonly string[] = [
  "/assets/fonts/NotoSans-cyrillic.woff2",
  "/assets/fonts/NotoSans-latin.woff2",
  "/assets/fonts/Nunito-cyrillic.woff2",
  "/assets/fonts/Nunito-latin.woff2",
];
