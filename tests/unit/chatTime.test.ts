// Время реплики: ISO с таймзоной → «ЧЧ:ММ» (тест-лист плана chat-live, тесты 6–7)
import { describe, expect, it } from "vitest";

import { formatChatTime } from "@/features/chat/lib/time";

describe("formatChatTime (ISO → подпись времени)", () => {
  it("test_format_time_from_iso", () => {
    // время без смещения парсится как локальное — подпись не зависит от TZ машины теста
    expect(formatChatTime("2026-11-13T10:00:04")).toBe("10:00");
  });

  it("test_null_time_is_empty", () => {
    // контракт допускает created_at: null — подписи нет
    expect(formatChatTime(null)).toBe("");
  });
});
