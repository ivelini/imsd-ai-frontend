// Бейджи главной: мок-данные в общем контракте badges (план product-badges)
// Правило: если в data приходит badges — страница выводит бейджи; разметка — шаблонная.
import { describe, expect, it } from "vitest";
import { HOME_DATA } from "@/data/products";
import { toBadgeView } from "@/shared/ui/badgeView";

describe("HOME_DATA.badges", () => {
  it("test_home_badges_use_badge_contract", () => {
    expect(HOME_DATA.badges).toHaveLength(3);

    for (const badge of HOME_DATA.badges) {
      const view = toBadgeView(badge);

      // цвет-пресет бэка → класс шаблона; иконка по пресету
      expect(["red", "gold", "green"]).toContain(view.iconKey);
      expect(view.className).toContain("benefit");
      expect(view.href).toBeTruthy();
      expect(view.text).toBeTruthy();
    }
  });
});
