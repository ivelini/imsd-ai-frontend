// Куда вернуть после входа: только внутренний путь, иначе профиль (без открытого редиректа)
import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/shared/lib/safeNext";

describe("safeNextPath", () => {
  it("test_allow_internal_path", () => {
    // свой путь после входа разрешён как есть
    expect(safeNextPath("/account/profile")).toBe("/account/profile");
  });

  it("test_reject_external_redirect", () => {
    // протокол-относительный и абсолютный URL — открытый редирект, подменяем дефолтом
    expect(safeNextPath("//evil.com")).toBe("/account/profile");
    expect(safeNextPath("https://evil.com")).toBe("/account/profile");
    expect(safeNextPath("evil")).toBe("/account/profile");
  });

  it("test_default_when_missing", () => {
    // параметра нет — ведём в профиль
    expect(safeNextPath(undefined)).toBe("/account/profile");
    expect(safeNextPath(null)).toBe("/account/profile");
    expect(safeNextPath("")).toBe("/account/profile");
  });
});
