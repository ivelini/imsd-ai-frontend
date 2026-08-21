// Кодировки select-value ⇄ FilterState (вынесено из CatalogFilter 21.08.2026)
import { describe, expect, it } from "vitest";
import { formatSelectValue, parseSelectValue } from "@/shared/lib/filterSelect";

describe("parseSelectValue: сброс", () => {
  it("test_reset_diameter_returns_undefined", () => {
    expect(parseSelectValue("diameter", "0")).toBeUndefined();
    expect(parseSelectValue("width", "0")).toBeUndefined();
    expect(parseSelectValue("profile", "0")).toBeUndefined();
    expect(parseSelectValue("int", "0")).toBeUndefined();
    expect(parseSelectValue("str", "0")).toBeUndefined();
  });
});

describe("parseSelectValue: диаметр", () => {
  it("test_parse_diameter_values", () => {
    expect(parseSelectValue("diameter", "r15")).toBe(15);
    expect(parseSelectValue("diameter", "15")).toBe(15);
    expect(parseSelectValue("diameter", "r13c")).toBe("13c");
    expect(parseSelectValue("diameter", "13c")).toBe("13c");
  });
});

describe("parseSelectValue: ширина/профиль", () => {
  it("test_parse_width_profile_values", () => {
    expect(parseSelectValue("width", "w185")).toBe(185);
    expect(parseSelectValue("profile", "p60")).toBe(60);
    expect(parseSelectValue("width", "abc")).toBeUndefined();
    expect(parseSelectValue("width", "r15")).toBeUndefined();
    expect(parseSelectValue("profile", "60")).toBeUndefined();
  });
});

describe("parseSelectValue: int/str", () => {
  it("test_parse_int_str_kinds", () => {
    expect(parseSelectValue("int", "175")).toBe(175);
    expect(parseSelectValue("str", "studded")).toBe("studded");
  });
});

describe("formatSelectValue: обратная кодировка", () => {
  it("test_format_select_values", () => {
    expect(formatSelectValue("diameter", undefined)).toBe("0");
    expect(formatSelectValue("diameter", 15)).toBe("r15");
    expect(formatSelectValue("diameter", "13c")).toBe("r13c");
    expect(formatSelectValue("diameter", 0)).toBe("0");
    expect(formatSelectValue("width", 185)).toBe("w185");
    expect(formatSelectValue("profile", 60)).toBe("p60");
    expect(formatSelectValue("int", 175)).toBe("175");
    expect(formatSelectValue("str", "studded")).toBe("studded");
  });
});
