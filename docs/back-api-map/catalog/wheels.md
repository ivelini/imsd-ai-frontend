# Wheels Catalog API

Базовый URL: `/api`  
Структура как у шин. Отличия: поля фильтра (PCD, ET, D, тип), нет сезона/профиля/типа шин.

---

### GET /api/catalog/wheels

Параметры query-string (все опциональны):

| Параметр | Тип | Пример |
|----------|-----|--------|
| `diameter` | int | `16` |
| `width` | float | `7.0` |
| `pcd` | string | `5x112` |
| `et` | int | `35` |
| `hub_bore` | float | `66.6` |
| `wheel_type` | string | `litoy` |
| `brand` | string | `replica` |
| `country` | string | `russia` |
| `price_min` | int | `3000` |
| `price_max` | int | `10000` |
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
            "id": "wheel-1",
            "slug": "7.0-r16-5-112-et35",
            "category": "wheels",
            "brandId": "replica",
            "brandName": "Replica",
            "modelSlug": "wheels-replica-7.0-r16-5-112-et35",
            "modelName": "Replica 7.0J R16 5x112 ET35",
            "width": 7.0,
            "diameter": 16,
            "pcd": "5x112",
            "et": 35,
            "hubBore": 66.6,
            "wheelType": "litoy",
            "price": 5600,
            "oldPrice": 6400,
            "code": "W00001",
            "country": "russia",
            "countryLabel": "Россия",
            "year": "2026",
            "quantity": 8,
            "image": "/assets/img/wheel-product.png",
            "title": "Replica 7.0J R16 5x112 ET35",
            "sizeSlug": "7.0-r16-5-112-et35",
            "sizeTitle": "7.0J R16 5x112 ET35"
        }
    ],
    "facets": {
        "diameter": {
            "values": [
                { "label": "R13", "value": "13", "count": 24 },
                { "label": "R14", "value": "14", "count": 32 },
                { "label": "R15", "value": "15", "count": 36 }
            ]
        },
        "width": {
            "values": [
                { "label": "5.0J", "value": "5.0", "count": 18 },
                { "label": "5.5J", "value": "5.5", "count": 24 },
                { "label": "6.0J", "value": "6.0", "count": 28 }
            ]
        },
        "pcd": {
            "values": [
                { "label": "4x100", "value": "4x100", "count": 30 },
                { "label": "5x112", "value": "5x112", "count": 80 }
            ]
        },
        "et": {
            "values": [
                { "label": "ET0", "value": "0", "count": 10 },
                { "label": "ET15", "value": "15", "count": 22 },
                { "label": "ET35", "value": "35", "count": 65 }
            ]
        },
        "hub_bore": {
            "values": [
                { "label": "D54.1", "value": "54.1", "count": 20 },
                { "label": "D57.1", "value": "57.1", "count": 25 },
                { "label": "D66.6", "value": "66.6", "count": 80 }
            ]
        },
        "wheel_type": {
            "values": [
                { "label": "Литой", "value": "litoy", "count": 140 },
                { "label": "Кованый", "value": "kovanyy", "count": 30 },
                { "label": "Штампованный", "value": "shtampovannyy", "count": 30 }
            ]
        },
        "brand": {
            "values": [
                { "label": "Replica", "value": "replica", "count": 68 },
                { "label": "K&K", "value": "k-and-k", "count": 54 }
            ]
        },
        "country": {
            "values": [
                { "label": "Россия", "value": "russia", "count": 160 },
                { "label": "Франция", "value": "france", "count": 40 }
            ]
        },
        "delivery": {
            "values": [
                { "label": "Сегодня", "value": "today", "count": 30 },
                { "label": "Поставка 1-2 дня", "value": "delivery-1-2", "count": 100 },
                { "label": "Поставка 2-5 дней", "value": "delivery-2-5", "count": 50 },
                { "label": "Поставка 5-7 дней", "value": "delivery-5-7", "count": 20 }
            ]
        },
        "price": {
            "min": 1364,
            "max": 61650
        }
    },
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 48,
        "total": 200
    }
}
```

---

### GET /api/catalog/wheels/auto/brands

```json
{
    "data": [
        { "id": "bmw", "name": "BMW", "models": [
            { "slug": "3-series", "name": "3 серия" },
            { "slug": "x5", "name": "X5" }
        ]},
        { "id": "audi", "name": "Audi", "models": [
            { "slug": "a4", "name": "A4" }
        ]}
    ]
}
```

`/api/catalog/wheels/auto/{brand}/models`, `.../{brand}/{model}/years`, `.../{brand}/{model}/{year}/modifications` — структура как у шин.

### GET /api/catalog/wheels/auto/{brand}/{model}/{year}/{modification}

```json
{
    "data": [
        {
            "categorySection": "Рекомендация производителя",
            "items": [
                {
                    "sizeLabel": "6.5J R16 5x112 ET30",
                    "sizes": [
                        {
                            "front": {
                                "id": "wheel-42", "slug": "6.5-r16-5-112-et30", "category": "wheels",
                                "brandId": "replica", "brandName": "Replica",
                                "modelSlug": "wheels-replica-6.5-r16-5-112-et30",
                                "modelName": "Replica 6.5J R16 5x112 ET30",
                                "width": 6.5, "diameter": 16, "pcd": "5x112", "et": 30, "hubBore": 66.6,
                                "wheelType": "litoy",
                                "price": 4800, "oldPrice": 5500, "code": "W00042",
                                "country": "russia", "countryLabel": "Россия",
                                "year": "2026", "quantity": 8,
                                "image": "/assets/img/wheel-product.png",
                                "title": "Replica 6.5J R16 5x112 ET30",
                                "sizeSlug": "6.5-r16-5-112-et30",
                                "sizeTitle": "6.5J R16 5x112 ET30"
                            }
                        }
                    ]
                },
                {
                    "sizeLabel": "7.5J R17 5x112 ET30 / 8.0J R18 5x112 ET30",
                    "sizes": [
                        {
                            "front": { "id": "wheel-67", "title": "K&K 7.5J R17 ...", "width": 7.5, "diameter": 17 },
                            "rear": { "id": "wheel-89", "title": "K&K 8.0J R18 ...", "width": 8.0, "diameter": 18 }
                        }
                    ]
                }
            ]
        }
    ]
}
```

### GET /api/catalog/wheels/auto/{brand}/{model}/{year}/{modification}/car-block

```json
{
    "data": {
        "name": "BMW 3 серия 320i, 2026 г.",
        "sections": [
            {
                "name": "Размеры",
                "options": [
                    { "label": "6.5J R16 5x112 ET30 D66.6", "width": 6.5, "diameter": 16, "pcd": "5x112", "et": 30, "checked": true }
                ]
            }
        ]
    }
}
```
