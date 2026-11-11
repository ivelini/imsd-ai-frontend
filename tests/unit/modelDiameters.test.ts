// Активная вкладка диаметра страницы модели (тест-лист плана wheel-models-live):
// запрошенный диаметр, если он есть у модели; иначе первый; пустой список — пустая строка.
import { describe, expect, it } from "vitest";
import { activeDiameter } from "@/features/catalog/lib/modelDiameters";

describe("activeDiameter", () => {
  const diameters = [
    { value: "r16", count: 2 },
    { value: "r17", count: 1 },
  ];

  it("test_active_diameter_selects_requested_or_first", () => {
    expect(activeDiameter(diameters, "r17")).toBe("r17");
    expect(activeDiameter(diameters, "r20")).toBe("r16");
    expect(activeDiameter([], "r16")).toBe("");
  });
});
