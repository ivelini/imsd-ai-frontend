# План: сервисные страницы — механика /api/service_pages — ✅ ВЫПОЛНЕНО 05.08.2026

**Цель:** контент ссылок в `header-location-block` (navigation-block) и `footer-content` приходит с бэка по `GET /api/service_pages` (массив `[{type: "header"|"footer", items: [{link, link_name}]}]`); каждая страница — по `GET /api/service_page/<slug-title>` (объект страницы).

**Задачи:**
1. Мок `src/data/servicePages.ts`: `SERVICE_PAGES` (шапка 7 ссылок, футер 12) + `SERVICE_PAGE_CONTENT` (slug → title + contentHtml) — имитация обоих эндпоинтов.
2. `shared/api/data.ts`: `getServicePages()`, `getServicePage(slug)`; `NavData` — `navLinks`/`footerGroups` → `headerLinks`/`footerLinks` (из service_pages); `NAV_LINKS`/`FOOTER_GROUPS` удалить из `nav.ts` (CatalogMenu не трогаем).
3. `Header`/`Footer`: рендер по items; футер — items делятся пополам на 2 группы `.fg-hide`.
4. Роут `/service-page/[slug]`: серверный, `getServicePage` → notFound, разметка по образцу статьи (`.article-title`/`.article-content`), крошки.
5. Реальные роуты в ссылках мока: «Статьи» → `/articles`, «Каталог» → `/catalog/tires`, остальные → `/service-page/<slug>`.

**Ожидаемый результат:** шапка и футер собираются из мок-ответа service_pages; сервисные страницы открываются с контентом; при API — замена setTimeout на fetch.

**Решения:** каталог-меню (CatalogMenu) остаётся статичным (механика заявлена только для header-location-block и footer-content); деление футера на 2 колонки — на фронте пополам (бэк отдаёт плоский items).
