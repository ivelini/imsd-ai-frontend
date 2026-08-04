# Tires Catalog API

Базовый URL: `/api`  
Все коллекции — `{ "data": [...], "meta": { "current_page", "last_page", "per_page", "total" } }`.  
Каталог — с `facets` (опции фильтра с количествами).

---

### GET /api/catalog/tires

Поиск товаров с фильтрацией, пагинацией и фасетами.  
Параметры query-string (все опциональны):

| Параметр | Тип | Пример |
|----------|-----|--------|
| `season` | string | `summer` |
| `brand` | string | `viatti` |
| `width` | int | `205` |
| `profile` | int | `55` |
| `diameter` | int | `16` |
| `tire_type` | string | `passenger` |
| `country` | string | `russia` |
| `price_min` | int | `3000` |
| `price_max` | int | `15000` |
| `delivery[]` | string[] | `today` |
| `city` | string | `chelyabinsk` |
| `page` | int | `1` |
| `per_page` | int | `48` |
| `sort_by` | string | `price` |
| `sort_dir` | string | `asc` |

```json
{
    "data": [
        {
            "id": "tire-1",
            "slug": "205-55-r16-84h",
            "category": "tires",
            "brandId": "viatti",
            "brandName": "Viatti",
            "modelSlug": "viatti-strada-2",
            "modelName": "V-130 Strada Asimmetrico",
            "width": 205,
            "profile": 55,
            "diameter": 16,
            "season": "summer",
            "loadIndex": "84",
            "speedRating": "H",
            "tireType": "passenger",
            "price": 6500,
            "oldPrice": 7300,
            "code": "АА-000001",
            "country": "russia",
            "countryLabel": "Россия",
            "year": "2025-2026",
            "quantity": 12,
            "image": "/assets/img/wheel-product.png",
            "title": "Шина Viatti V-130 Strada Asimmetrico 205/55 R16 84H летняя",
            "sizeSlug": "205-55-r16-84h",
            "sizeTitle": "205/55 R16 84H",
            "euLabel": {
                "rollingResistance": "B",
                "wetGrip": "C",
                "noiseEmission": 71
            },
            "parameters": [
                { "name": "Код товара:", "value": "АА-000001" },
                {
                    "name": "Производитель:",
                    "value": "Viatti",
                    "badge": true,
                    "description": {
                        "title": "Viatti",
                        "text": "Viatti — один из ведущих производителей автомобильных шин..."
                    }
                },
                {
                    "name": "Страна производства:",
                    "value": "Россия",
                    "badge": true,
                    "description": {
                        "title": "Страна производства — Россия",
                        "text": "Производство осуществляется на современных заводах..."
                    }
                },
                {
                    "name": "Год выпуска:",
                    "value": "2025-2026",
                    "badge": true,
                    "description": {
                        "title": "Год выпуска — 2025-2026",
                        "text": "Срок службы шин — 5 лет с даты изготовления..."
                    }
                }
            ]
        }
    ],
    "facets": {
        "season": {
            "values": [
                { "label": "Летняя", "value": "summer", "count": 245 },
                { "label": "Зимняя", "value": "winter", "count": 180 },
                { "label": "Всесезонная", "value": "all-season", "count": 75 }
            ]
        },
        "brand": {
            "values": [
                { "label": "Viatti", "value": "viatti", "count": 245 },
                { "label": "Michelin", "value": "michelin", "count": 180 }
            ]
        },
        "width": {
            "values": [
                { "label": "145", "value": "145", "count": 12 },
                { "label": "155", "value": "155", "count": 18 }
            ]
        },
        "profile": {
            "values": [
                { "label": "30", "value": "30", "count": 45 },
                { "label": "35", "value": "35", "count": 67 }
            ]
        },
        "diameter": {
            "values": [
                { "label": "R13", "value": "13", "count": 30 },
                { "label": "R14", "value": "14", "count": 52 }
            ]
        },
        "tire_type": {
            "values": [
                { "label": "Легковая", "value": "passenger", "count": 350 },
                { "label": "Внедорожная", "value": "suv", "count": 110 },
                { "label": "Коммерческая", "value": "commercial", "count": 40 }
            ]
        },
        "country": {
            "values": [
                { "label": "Россия", "value": "russia", "count": 200 },
                { "label": "Франция", "value": "france", "count": 180 }
            ]
        },
        "delivery": {
            "values": [
                { "label": "Сегодня", "value": "today", "count": 50 },
                { "label": "Поставка 1-2 дня", "value": "delivery-1-2", "count": 200 },
                { "label": "Поставка 2-5 дней", "value": "delivery-2-5", "count": 150 },
                { "label": "Поставка 5-7 дней", "value": "delivery-5-7", "count": 100 }
            ]
        },
        "price": {
            "min": 2500,
            "max": 85000
        }
    },
    "meta": {
        "current_page": 1,
        "last_page": 10,
        "per_page": 48,
        "total": 500
    }
}
```

---

### GET /api/catalog/tires/auto/brands

Марки авто для каскада «По автомобилю».

```json
{
    "data": [
        {
            "id": "bmw",
            "name": "BMW",
            "models": [
                { "slug": "x6", "name": "X6" },
                { "slug": "3-series", "name": "3 серия" }
            ]
        },
        {
            "id": "audi",
            "name": "Audi",
            "models": [
                { "slug": "q7", "name": "Q7" }
            ]
        }
    ]
}
```

### GET /api/catalog/tires/auto/{brand}/models

Модели для выбранной марки.

```json
{
    "data": [
        { "slug": "x6", "name": "X6" },
        { "slug": "3-series", "name": "3 серия" }
    ]
}
```

### GET /api/catalog/tires/auto/{brand}/{model}/years

Годы выпуска.

```json
{
    "data": [2026, 2025, 2024, 2023, 2022, 2021, 2020]
}
```

### GET /api/catalog/tires/auto/{brand}/{model}/{year}/modifications

Модификации.

```json
{
    "data": [
        {
            "id": "xdrive30d",
            "name": "xDrive 30d",
            "sizes": [
                { "width": 265, "profile": 50, "diameter": 19 },
                { "width": 275, "profile": 45, "diameter": 20 },
                { "width": 305, "profile": 40, "diameter": 20 }
            ]
        },
        {
            "id": "xdrive40i",
            "name": "xDrive 40i",
            "sizes": [
                { "width": 275, "profile": 45, "diameter": 20 },
                { "width": 305, "profile": 40, "diameter": 20 }
            ]
        }
    ]
}
```

### GET /api/catalog/tires/auto/{brand}/{model}/{year}/{modification}

Результат подбора — секции с товарами.  
Параметры query-string: `price_min`, `price_max`, `country`, `delivery[]`, `city` (опциональны).

```json
{
    "data": [
        {
            "categorySection": "Рекомендация производителя",
            "items": [
                {
                    "sizeLabel": "265/50 R19",
                    "sizes": [
                        {
                            "front": {
                                "id": "tire-42", "slug": "265-50-r19-84h", "category": "tires",
                                "brandId": "viatti", "brandName": "Viatti",
                                "modelSlug": "viatti-strada-2", "modelName": "V-130 Strada Asimmetrico",
                                "width": 265, "profile": 50, "diameter": 19,
                                "season": "summer", "loadIndex": "84", "speedRating": "H", "tireType": "passenger",
                                "price": 5800, "oldPrice": 6500, "code": "АА-000042",
                                "country": "russia", "countryLabel": "Россия",
                                "year": "2025-2026", "quantity": 12,
                                "image": "/assets/img/wheel-product.png",
                                "title": "Шина Viatti V-130 Strada Asimmetrico 265/50 R19 84H летняя",
                                "sizeSlug": "265-50-r19-84h", "sizeTitle": "265/50 R19 84H",
                                "euLabel": { "rollingResistance": "B", "wetGrip": "C", "noiseEmission": 71 }
                            }
                        }
                    ]
                },
                {
                    "sizeLabel": "275/45 R20 - 305/40 R20",
                    "sizes": [
                        {
                            "front": { "id": "tire-58", "title": "Шина Viatti ...", "width": 275, "profile": 45, "diameter": 20 },
                            "rear": { "id": "tire-73", "title": "Шина Viatti ...", "width": 305, "profile": 40, "diameter": 20 }
                        }
                    ]
                }
            ]
        },
        {
            "categorySection": "Лучшая альтернатива",
            "items": [
                {
                    "sizeLabel": "275/40 R21 - 315/35 R21",
                    "sizes": [
                        {
                            "front": { "id": "tire-91", "width": 275, "profile": 40, "diameter": 21 },
                            "rear": { "id": "tire-105", "width": 315, "profile": 35, "diameter": 21 }
                        }
                    ]
                },
                {
                    "sizeLabel": "275/35 R22 - 315/30 R22",
                    "sizes": [
                        {
                            "front": { "id": "tire-118", "width": 275, "profile": 35, "diameter": 22 },
                            "rear": { "id": "tire-132", "width": 315, "profile": 30, "diameter": 22 }
                        }
                    ]
                }
            ]
        }
    ]
}
```

### GET /api/catalog/tires/auto/{brand}/{model}/{year}/{modification}/car-block

Блок с информацией о выбранном авто и его размерах.

```json
{
    "data": {
        "name": "BMW X6 xDrive 30d, 2026 г.",
        "sections": [
            {
                "name": "Размеры",
                "options": [
                    { "label": "265/50 R19", "width": 265, "profile": 50, "diameter": 19, "checked": true },
                    { "label": "275/45 R20", "width": 275, "profile": 45, "diameter": 20 },
                    { "label": "305/40 R20", "width": 305, "profile": 40, "diameter": 20 }
                ]
            }
        ]
    }
}
```

---

### GET /api/tires/{modelSlug}

Страница модели шины.

```json
{
    "data": {
        "slug": "viatti-strada-2",
        "name": "V-130 Strada Asimmetrico",
        "brandName": "Viatti",
        "image": "/assets/img/large.png",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        "params": [
            { "name": "Сезонность", "value": "Летняя" },
            { "name": "Назначение", "value": "Легковая" },
            { "name": "Тип протектора", "value": "асимметричный" },
            { "name": "Страна бренда", "value": "Россия" },
            { "name": "Страна производства", "value": "Россия" },
            { "name": "Год выпуска", "value": "2025-2026" },
            { "name": "Шипы", "value": "Нет" },
            { "name": "Run flat", "value": "Нет" }
        ],
        "sizesByDiameter": {
            "r14": [
                { "id": "tire-1", "slug": "175-70-r14-84h", "category": "tires", ... }
            ],
            "r15": [ ... ],
            "r16": [ ... ]
        },
        "seo": {
            "title": "Шины Viatti V-130 Strada Asimmetrico — купить в Челябинске",
            "h1": "Viatti V-130 Strada Asimmetrico",
            "description": "Летние шины Viatti V-130 Strada Asimmetrico ...",
            "breadcrumbs": [
                { "title": "Главная", "url": "/" },
                { "title": "Шины", "url": "/catalog/tires" },
                { "title": "Viatti", "url": "/catalog/tires/viatti" }
            ]
        }
    }
}
```

---

### GET /api/tires/{modelSlug}/{sizeSlug}

Страница товара (типоразмер).  
Параметры query-string: `city` (опционально).

```json
{
    "data": {
        "id": "tire-1",
        "slug": "175-60-r14-84h",
        "category": "tires",
        "brandId": "viatti",
        "brandName": "Viatti",
        "modelSlug": "viatti-strada-2",
        "modelName": "V-130 Strada Asimmetrico",
        "width": 175,
        "profile": 60,
        "diameter": 14,
        "season": "summer",
        "loadIndex": "84",
        "speedRating": "H",
        "tireType": "passenger",
        "price": 6215,
        "oldPrice": 6961,
        "code": "АА-075632",
        "country": "russia",
        "countryLabel": "Россия",
        "year": "2025-2026",
        "quantity": 15,
        "image": "/assets/img/wheel-product.png",
        "title": "Шина Viatti V-130 Strada Asimmetrico 175/60 R14 84H летняя",
        "sizeSlug": "175-60-r14-84h",
        "sizeTitle": "175/60 R14 84H",
        "euLabel": {
            "rollingResistance": "C",
            "wetGrip": "C",
            "noiseEmission": 70
        },

        "images": [
            "/assets/img/large.png",
            "/assets/img/disk-1.png",
            "/assets/img/wheel-product.png",
            "/assets/img/disk-2.png",
            "/assets/img/large.png",
            "/assets/img/disk-1.png",
            "/assets/img/wheel-product.png",
            "/assets/img/disk-2.png"
        ],

        "parameters": [
            { "name": "Код товара:", "value": "АА-075632" },
            {
                "name": "Производитель:",
                "value": "Viatti",
                "badge": true,
                "description": {
                    "title": "Viatti",
                    "text": "Viatti — один из ведущих производителей автомобильных шин..."
                }
            },
            { "name": "Ширина профиля:", "value": "175" },
            { "name": "Высота профиля:", "value": "60" },
            { "name": "Посадочный диаметр:", "value": "14" },
            { "name": "Сезонность:", "value": "Летняя" },
            { "name": "Страна бренда:", "value": "Россия" },
            { "name": "Индекс скорости и нагрузки:", "value": "84H" },
            {
                "name": "Страна производства:",
                "value": "Россия",
                "badge": true,
                "description": {
                    "title": "Страна производства — Россия",
                    "text": "Производство шин осуществляется на современных заводах в России..."
                }
            },
            {
                "name": "Год выпуска:",
                "value": "2025-2026",
                "badge": true,
                "description": {
                    "title": "Год выпуска — 2025-2026",
                    "text": "Шины выпущены в период 2025-2026. Срок службы..."
                }
            },
            { "name": "Шипы:", "value": "Нет" },
            { "name": "Run flat:", "value": "Нет" }
        ],

        "seasonLabel": "Летняя",
        "loadSpeedLabel": "84H",
        "spikesLabel": "Нет",
        "runFlatLabel": "Нет",
        "productionCountryLabel": "Россия",

        "quantityOptions": [
            { "value": 1, "label": "6 215 ₽ - 1 шт." },
            { "value": 2, "label": "12 430 ₽ - 2 шт." },
            { "value": 3, "label": "18 645 ₽ - 3 шт." },
            { "value": 4, "label": "24 860 ₽ - 4 шт." }
        ],

        "pickupDate": "8 авг (сб)",
        "deliveryLabel": "бесплатно",
        "storeAddress": "Челябинск - Свердловский тракт 3Н (Автоальянс)",
        "storeHours": "Рабочие дни: 09:00-19:00 / Выходные: 09:00-17:00",

        "descriptionHtml": "<p>V-130 Strada Asimmetrico — летняя шина...</p>",
        "availabilityText": "Информация о наличии продукта обновляется в реальном времени...",
        "deliveryText": "Доставка осуществляется по всей России...",
        "warrantyText": "Гарантия на все шины интернет-магазина «Автоальянс» составляет 12 месяцев...",
        "reviewCount": 25,

        "seo": {
            "title": "Шина Viatti V-130 Strada Asimmetrico 175/60 R14 84H летняя",
            "description": "Купить Шина Viatti V-130 Strada Asimmetrico 175/60 R14 84H летняя в Челябинске. Цена 6 215 ₽.",
            "breadcrumbs": [
                { "title": "Главная", "url": "/" },
                { "title": "Каталог шин", "url": "/catalog/tires" },
                { "title": "Viatti", "url": "/tires/viatti-strada-2" },
                { "title": "175/60 R14 84H" }
            ]
        }
    }
}
```

**Поля параметров:**
| Поле | Тип | Описание |
|---|---|---|
| `parameters[].name` | string | Название параметра (с двоеточием) |
| `parameters[].value` | string | Значение для отображения |
| `parameters[].badge` | bool? | `true` → рендерить как `p-badge` (кликабельная ссылка) |
| `parameters[].description` | object? | Если badge=true — попап с `title` и `text` при клике |
