// Decimal-строки бэка («7.0», «40.0») → запись без хвостовых нулей (shared/lib/decimal)
import { describe, expect, it } from "vitest";
import { decimal } from "@/shared/lib/decimal";

describe("decimal", () => {
  it("test_decimal_strips_trailing_zero", () => {
    expect(decimal("7.0")).toBe("7");
    expect(decimal("40.0")).toBe("40");
  });

  it("test_decimal_keeps_fraction", () => {
    expect(decimal("73.1")).toBe("73.1");
  });

  it("test_decimal_accepts_number", () => {
    expect(decimal(16)).toBe("16");
  });
});
