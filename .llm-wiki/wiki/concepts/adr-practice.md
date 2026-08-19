# Практика ADR в проекте

> Sources: documentations/adr/README.md, 2026-08-19; documentations/adr/0000-template.md, 2026-08-19
> Raw: [README.md](../../raw/project/2026-08-19-adr-practice-readme.md); [0000-template.md](../../raw/project/2026-08-19-adr-template.md)

## Overview

Архитектурные решения проекта записываются в `documentations/adr/` по практике: полстраницы, 4 поля (Контекст / Решение / Почему / Последствия), в момент принятия. Полные правила — глобальный `adr.md`; шаблон `0000-template.md` — единственный источник формата.

## Практика

- Запись в момент принятия решения, не задним числом.
- 4 поля: Контекст (проблема, 2–5 предложений) → Решение (что и почему, без деталей реализации) → Почему (альтернативы и их цена) → Последствия (что проще/сложнее, что пересмотрим).
- Статусы: Proposed / Accepted / Superseded (отменённый файл не удаляется).
- ADR входит в тот же коммит, что и код решения.

## Анти-правила (что НЕ писать)

- Детали реализации (расписания, имена команд, размеры батчей) — живут в коде и карте.
- Решения без развилки: критерий — есть ли выбор, за который будущий человек/AI может заплатить по-другому.
- Пересказ механики: ADR отвечает на «почему так», а не «как работает».

## Состояние базы

4 принятых ADR (0001–0004): баррел data.ts, конфиг-грамматика URL, пагинация типоразмеров, город как контекст. Индекс — в `documentations/adr/README.md` и в [project-architecture](project-architecture.md).

## See Also

- [project-architecture](project-architecture.md)
- [api-barrel-data-ts](api-barrel-data-ts.md), [catalog-url-grammar](catalog-url-grammar.md), [model-sizes-pagination](model-sizes-pagination.md), [city-request-context](city-request-context.md) — сами решения
