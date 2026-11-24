// Адаптер корзины: DTO бэка → строка корзины; тип товара и поиск строки по товару
import { describe, expect, it } from "vitest";

import { toCartView, type CartDto } from "@/shared/api/cart";
import { findCartItemByProduct, toItemableType } from "@/features/cart/lib/itemable";
import { PRODUCT_PLACEHOLDER } from "@/shared/lib/productImage";

const dto: CartDto = {
  id: 7,
  city: { id: 1, name: "Челябинск" },
  items: [
    {
      id: 1,
      itemable_type: "tire",
      itemable_id: 10,
      name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H",
      slug: "viatti-v-130-185-60-r15-84h",
      brand: { id: 3, name: "Viatti", slug: "viatti" },
      quantity: 4,
      unit_price: 10100,
      total: 40400,
      available: true,
      delivery: { delivery_min: 1, delivery_max: 2 },
      count_in_stock: 12,
    },
  ],
  subtotal: 40400,
};

describe("toCartView (позиция корзины)", () => {
  it("test_maps_cart_item_dto_to_row", () => {
    // id строки и id товара разведены: по первому меняем/удаляем, по второму ищем в каталоге
    const cart = toCartView(dto);

    expect(cart.subtotal).toBe(40400);
    expect(cart.items[0]).toEqual({
      id: "1",
      itemableId: "10",
      itemableType: "tire",
      name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H",
      brandName: "Viatti",
      price: 10100,
      total: 40400,
      quantity: 4,
      available: true,
      countInStock: 12,
      image: PRODUCT_PLACEHOLDER,
    });
  });

  it("test_keeps_null_price_for_unavailable_item", () => {
    // нет цены города — null, а не 0: позиция недоступна, сумма не выдумывается
    const cart = toCartView({
      ...dto,
      items: [{ ...dto.items[0], unit_price: null, total: null, available: false }],
      subtotal: 0,
    });

    expect(cart.items[0].price).toBeNull();
    expect(cart.items[0].total).toBeNull();
    expect(cart.items[0].available).toBe(false);
  });
});

describe("toItemableType (тип товара → тип позиции API)", () => {
  it("test_map_category_to_itemable_type", () => {
    // неизвестный тип — отказ, а не молчаливый дефолт
    expect(toItemableType("tires")).toBe("tire");
    expect(toItemableType("wheels")).toBe("wheel");
    expect(() => toItemableType("services")).toThrow();
  });
});

describe("findCartItemByProduct (кнопка «Убрать»)", () => {
  it("test_find_cart_line_by_product", () => {
    // поиск по паре «тип + id товара», а не по id строки корзины
    const { items } = toCartView(dto);

    expect(
      findCartItemByProduct(items, { itemableType: "tire", itemableId: "10" })?.id,
    ).toBe("1");
    expect(
      findCartItemByProduct(items, { itemableType: "wheel", itemableId: "10" }),
    ).toBeUndefined();
  });
});
