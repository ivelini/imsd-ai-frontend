// Адаптер DTO GET /api/reference/filter/tire → FilterOptions
// Контракт бэка: brand/country — slug, размеры — префиксные значения (w185, p60, r15, r13C),
// studded — строки ("studded"/"not_studded"); голые числа — переходный период (префикс добавляется)
import { describe, expect, it } from "vitest";
import { toFilterOptions } from "@/shared/api/catalog";
import type { TireFilterValuesDto } from "@/features/catalog/types";

const baseDto: TireFilterValuesDto = {
  width: [{ label: 185, value: 185 }],
  profile: [{ label: 60, value: 60 }],
  diameter: [{ label: "R15", value: "r15" }],
  season: [{ label: "Зимняя", value: "winter" }],
  studded: [
    { label: "Шипованная", value: "studded" },
    { label: "Не шипованная", value: "not_studded" },
  ],
  brand: [{ label: "Bridgestone", value: "bridgestone" }],
  country: [{ label: "Россия", value: "rossiia" }],
  delivery: [{ label: "От 1 до 3 дней", value: "between1and3days" }],
  price: { min: 2461.2, max: 46641 },
};

describe("toFilterOptions", () => {
  it("test_int_values_get_size_prefix", () => {
    const opts = toFilterOptions(baseDto);
    expect(opts.widths).toEqual([{ label: "185", value: "w185" }]);
    expect(opts.profiles).toEqual([{ label: "60", value: "p60" }]);
  });

  it("test_prefixed_values_passthrough", () => {
    const opts = toFilterOptions({ ...baseDto, width: [{ label: 185, value: "w185" }] });
    expect(opts.widths).toEqual([{ label: "185", value: "w185" }]);
  });

  it("test_slug_values_passthrough", () => {
    const opts = toFilterOptions(baseDto);
    expect(opts.brands).toEqual([{ label: "Bridgestone", value: "bridgestone" }]);
    expect(opts.countries).toEqual([{ label: "Россия", value: "rossiia" }]);
    expect(opts.diameters).toEqual([{ label: "R15", value: "r15" }]);
    expect(opts.seasons).toEqual([{ label: "Зимняя", value: "winter" }]);
    expect(opts.delivery).toEqual([{ label: "От 1 до 3 дней", value: "between1and3days" }]);
  });

  it("test_studded_mapped", () => {
    const opts = toFilterOptions(baseDto);
    expect(opts.studded).toEqual([
      { label: "Шипованная", value: "studded" },
      { label: "Не шипованная", value: "not_studded" },
    ]);
  });

  it("test_price_maps_to_min_max", () => {
    const opts = toFilterOptions(baseDto);
    expect(opts.priceMin).toBe(2461.2);
    expect(opts.priceMax).toBe(46641);
  });

  it("test_absent_delivery_becomes_empty", () => {
    const opts = toFilterOptions({ ...baseDto, delivery: [] });
    expect(opts.delivery).toEqual([]);
    expect(opts.pcds).toEqual([]);
    expect(opts.ets).toEqual([]);
    expect(opts.hubBores).toEqual([]);
    expect(opts.wheelTypes).toEqual([]);
  });
});
