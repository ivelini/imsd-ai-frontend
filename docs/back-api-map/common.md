# Common API

Базовый URL: `/api`  
Все ответы — `{ "data": ... }`.

---

### GET /api/nav

Навигация: главное меню, подвал, бенефиты.

```json
{
    "data": {
        "menu": [
            { "label": "Шины", "href": "/catalog/tires" },
            { "label": "Диски", "href": "/catalog/wheels" },
            { "label": "Подбор по авто", "href": "/catalog/tires/auto" }
        ],
        "footer": {
            "groups": [
                {
                    "title": "Каталог",
                    "links": [
                        { "label": "Шины", "href": "/catalog/tires" },
                        { "label": "Диски", "href": "/catalog/wheels" }
                    ]
                },
                {
                    "title": "Покупателям",
                    "links": [
                        { "label": "Как заказать", "href": "/articles/how-to-order" },
                        { "label": "Доставка", "href": "/articles/delivery" },
                        { "label": "Гарантия", "href": "/articles/warranty" }
                    ]
                }
            ],
            "phone": "+7 (351) 200-00-00",
            "copyright": "© 2026 Альянс. Все права защищены."
        },
        "benefits": [
            { "title": "Быстрая доставка", "color": "red" },
            { "title": "Гарантия качества", "color": "gold" },
            { "title": "Профессиональный шиномонтаж", "color": "green" }
        ]
    }
}
```

---

### GET /api/home/{category}

Товары для главной страницы. `category` = `wheels` | `disks`.

```json
{
    "data": [
        {
            "id": "home-1",
            "name": "Viatti V-130 Strada Asimmetrico",
            "price": 6500,
            "oldPrice": 7300,
            "image": "/assets/img/wheel-product.png",
            "season": "summer",
            "rating": 4.5,
            "reviews": 128,
            "href": "/tires/viatti-strada-2/205-55-r16-84h"
        }
    ]
}
```

---

### GET /api/news

Новости.

```json
{
    "data": [
        {
            "id": "news-1",
            "title": "Новые поступления летних шин",
            "text": "В наш каталог добавлены новые модели...",
            "image": "/assets/img/news-1.png",
            "date": "2026-07-15",
            "href": "/articles/1"
        }
    ]
}
```

---

### GET /api/seo

Параметры query-string: `brand`, `season`, `category`, `model` (опциональны — определяют контекст страницы).

```json
{
    "data": {
        "title": "Купить шины Viatti в Челябинске",
        "h1": "Шины Viatti",
        "description": "Летние и зимние шины Viatti в наличии. Быстрая доставка, гарантия качества.",
        "advantages": "Почему выгодно покупать шины у нас: прямые поставки от производителей, гарантия качества, быстрая доставка по Челябинску и области, профессиональный шиномонтаж.",
        "sizes": [
            { "label": "R14", "href": "/catalog/tires/viatti/r14" },
            { "label": "R15", "href": "/catalog/tires/viatti/r15" }
        ],
        "breadcrumbs": [
            { "title": "Главная", "url": "/" },
            { "title": "Шины", "url": "/catalog/tires" }
        ]
    }
}
```
