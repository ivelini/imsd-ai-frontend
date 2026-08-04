# Geo API

Базовый URL: `/api`  
Все ответы обёрнуты в `{ "data": ... }` (Laravel API Resource).

---

### GET /api/geo

Города и регионы для попапа выбора города.

```json
{
    "data": {
        "regions": [
            { "id": "1132", "name": "Челябинская обл" },
            { "id": "994", "name": "Свердловская обл" },
            { "id": "594", "name": "Курганская обл" }
        ],
        "cities": [
            { "id": "1132", "label": "Челябинск", "value": "chelyabinsk", "regionId": "1132" },
            { "id": "994", "label": "Екатеринбург", "value": "ekaterinburg", "regionId": "994" }
        ],
        "defaultCity": "Челябинск",
        "defaultCityValue": "chelyabinsk"
    }
}
```
