# План: кнопка «Убрать» при наличии товара в корзине

**Дата:** 04.08.2026

## Контекст

В каталоге и на странице товара кнопка покупки не учитывает, что товар уже в корзине. Нужно: если товар найден в корзине — кнопка меняется на «Убрать» (серый фон, тёмный текст, ярлык вместо пакета), клик открывает попап подтверждения удаления.

## Решения (обсуждены)
- На странице товара — та же логика: товар в корзине → «Убрать»
- Попап подтверждения: «Убрать товар из корзины?» + название товара + кнопки «Убрать» (красная) / «Отмена»
- Серый стиль: новый CSS-класс-модификатор

## Файлы

| Действие | Путь | Назначение |
|---|---|---|
| **Создать** | `src/shared/ui/ConfirmRemovePopup.tsx` | Client: попап подтверждения (overlay, X/ESC, заголовок, название товара, «Убрать»/«Отмена») |
| **Изменить** | `src/features/catalog/components/BuyButton.tsx` | Состояние «в корзине»: серый + «Убрать», клик → ConfirmRemovePopup → useRemoveFromCart |
| **Изменить** | `src/features/product/components/AddToCartBlock.tsx` | Кнопка «Убрать» при наличии в корзине (вместо «Добавить в корзину») |
| **Изменить** | `src/app/style.css` | `.buy-now--remove`, `.add-to-cart-button--remove` (серый), `.confirm-popup-*` |

## Логика BuyButton (каталог)

```tsx
const cartItem = items?.find(i => i.id === product.id);
const isInCart = !!cartItem;
const [confirmOpen, setConfirmOpen] = useState(false);

// isInCart:
//   <button className="buy-now buy-now--remove" onClick={() => setConfirmOpen(true)}>
//     <p>Убрать</p><img src="/assets/img/trash.svg" />  // или другой ярлык
//   </button>
//   + ConfirmRemovePopup → onConfirm: removeFromCart(id) → закрыть
// иначе: как сейчас — «Купить» → useAddToCart → CartPopup
```

## Логика AddToCartBlock (товар)

- `isInCart = !!cartItem` — уже вычисляется
- Если isInCart: кнопка `add-to-cart-button primary-button add-to-cart-button--remove` с текстом «Убрать», клик → ConfirmRemovePopup
- Иначе: текущая логика (quantity select + «Добавить в корзину» + CartPopup)
- Quantity select оставить видимым в обоих состояниях

## ConfirmRemovePopup

```tsx
interface ConfirmRemovePopupProps {
  name: string;          // название товара
  onConfirm: () => void; // удалить
  onClose: () => void;   // отмена / X / ESC / оверлей
}
```

- Overlay как у CartPopup (`.badge-popup-overlay` стиль или свой `.confirm-popup-overlay`)
- Кнопки: «Убрать» (красный, `--color-red`) + «Отмена» (серый)
- ESC/X/оверлей → onClose

## CSS

- `.buy-now--remove`: серый фон (`#f5f5f5`/`--color-bg-soft`), тёмный текст, рамка
- `.add-to-cart-button--remove`: то же для страницы товара
- `.confirm-popup-overlay`, `.confirm-popup`, `.confirm-popup-title`, `.confirm-popup-text`, `.confirm-popup-btns`, `.confirm-popup-btn--remove`, `.confirm-popup-btn--cancel`

## Ярлык на кнопке «Убрать»

В каталоге сейчас `bag.svg`. Для «Убрать» нужен другой ярлык — `trash.svg` (создать, 25×25 в стиле мокапа) или крестик. Уточнить при реализации.

## Порядок

1. `ConfirmRemovePopup` (shared/ui)
2. CSS (попап + серые кнопки)
3. `BuyButton` — состояние «в корзине»
4. `AddToCartBlock` — состояние «в корзине»
5. Верификация: добавить товар → кнопка «Убрать» → попап → удаление → кнопка «Купить»
