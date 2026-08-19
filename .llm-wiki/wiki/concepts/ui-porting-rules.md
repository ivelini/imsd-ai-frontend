# Правила переноса вёрстки из мокапа в Next.js

> Sources: .claude/rules/ui-porting.md, 2026-08-19
> Raw: [ui-porting.md](../../raw/project/2026-08-19-rule-ui-porting.md)

## Overview

Разметка переносится 1-в-1 (классы и DOM), теги семантизируются без смены классов; данные — моки `src/data/`; стилизация только через глобальный `style.css` (BEM, без Tailwind); интерактив — React state, не CSS-модификаторы.

## Правила

- **Разметка 1-в-1**, семантизация только тегов (`div`→`button` и т.п.); данные — синхронные моки из `src/data/`; ассеты в `public/assets/` (пути CSS: `../img` → `/assets/img`).
- **style.css** — копия `.template/assets/css/style.css` (BEM, токены `:root`), импорт в корневом layout; изменения из `.template/` переносятся в `src/app/style.css`. Tailwind не используется; шрифты Noto Sans/Nunito через `@font-face`.
- **Интерактив**: состояния мокапа → React state/props; JS-библиотеки мокапа (slick, fancybox, noUiSlider) не нужны — нативные средства.
- **Брейкпоинты**: 640 / 1024 / 1366 px (мобильный каталога — 648 px); контрольные разрешения верификации — 390 / 768 / 1024 / 1366 / 1920 px.

## See Also

- [project-architecture](project-architecture.md)
- [frontend-architecture-rules](frontend-architecture-rules.md)
