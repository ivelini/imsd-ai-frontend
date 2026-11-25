// Показ телефона: канон бэка «7XXXXXXXXXX» / «8XXXXXXXXXX» → «+7 951 123-45-67»
import { describe, expect, it } from "vitest";

import { formatPhone } from "@/shared/lib/phone";

describe("formatPhone", () => {
  it("test_format_canonical_phone", () => {
    // оба канона приводятся к одному виду для экрана
    expect(formatPhone("79511234567")).toBe("+7 951 123-45-67");
    expect(formatPhone("89511234567")).toBe("+7 951 123-45-67");
  });

  it("test_keep_unparsed_phone", () => {
    // нераспознанная строка возвращается как есть — ввод не портим
    expect(formatPhone("123")).toBe("123");
    expect(formatPhone("abc")).toBe("abc");
    expect(formatPhone("")).toBe("");
  });
});
