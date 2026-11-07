// Вкладки карточки товара (тест-лист плана product-card-live)
// Вкладка выводится, только если у неё есть контент; «Отзывы» бэк не отдаёт — вкладки нет.
import { describe, expect, it } from "vitest";
import { productTabs } from "@/features/product/lib/productTabs";

describe("productTabs", () => {
  it("test_tabs_follow_available_content", () => {
    const tabs = productTabs({
      description: null,
      availabilityText: "",
      deliveryText: "Доставка транспортной компанией.",
      warrantyText: "Гарантия производителя.",
    });

    expect(tabs.map((t) => t.id)).toEqual(["delivery", "warranty", "payment"]);
  });
});
