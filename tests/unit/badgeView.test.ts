// Представление плашки-бейджа: чистая функция → рендер (тест-лист плана product-badges)
// Контракт бэка 23.10.2026: элемент стека badges в карточке товара (ADR бэка common/0045).
import { describe, expect, it } from "vitest";
import { toBadgeView, toBadgeViews } from "@/shared/ui/badgeView";
import type { Badge } from "@/shared/types/badge";

/** Бейдж по умолчанию: красная плашка модели без ссылки. */
function badge(overrides: Partial<Badge> = {}): Badge {
  return {
    text: "Хит продаж",
    color: "red",
    icon_key: null,
    link: null,
    owner_type: "model",
    owner_name: "BEL-307",
    ...overrides,
  };
}

describe("toBadgeView", () => {
  it("test_badge_without_link_is_not_anchor", () => {
    const view = toBadgeView(badge());

    expect(view.href).toBeNull();
    expect(view.external).toBe(false);
    expect(view.text).toBe("Хит продаж");
    expect(view.className).toContain("benefit");
    expect(view.className).toContain("benefit--red");
  });

  it("test_external_link_marked_external", () => {
    const view = toBadgeView(badge({ link: "https://aalyans.ru/promo" }));

    expect(view.href).toBe("https://aalyans.ru/promo");
    expect(view.external).toBe(true);
  });

  it("test_internal_link_is_not_external", () => {
    const view = toBadgeView(badge({ link: "/catalog/tires/yokohama" }));

    expect(view.href).toBe("/catalog/tires/yokohama");
    expect(view.external).toBe(false);
  });

  it("test_unknown_icon_key_falls_back_to_color", () => {
    const view = toBadgeView(badge({ icon_key: "ывывыв", color: "gold" }));

    expect(view.iconKey).toBe("gold");
  });

  it("test_icon_key_wins_over_color", () => {
    const view = toBadgeView(badge({ icon_key: "green", color: "red" }));

    expect(view.iconKey).toBe("green");
  });

  it("test_missing_icon_key_falls_back_to_color", () => {
    const view = toBadgeView(badge({ icon_key: null, color: "red" }));

    expect(view.iconKey).toBe("red");
  });
});

describe("toBadgeViews", () => {
  it("test_empty_stack_yields_no_badge_views", () => {
    expect(toBadgeViews([])).toEqual([]);
  });
});
