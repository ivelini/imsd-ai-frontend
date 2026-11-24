// Кулдаун повторной отправки кода и формат таймера (общие для записи и заказа)
import { describe, expect, it } from "vitest";

import { formatCountdown, resendRemaining } from "@/shared/lib/countdown";

describe("resendRemaining (остаток до повторной отправки кода)", () => {
  it("test_resend_remaining_counts_down", () => {
    // отсчёт от момента выдачи; ниже нуля не уходит
    const issuedAt = 1_700_000_000_000;

    expect(resendRemaining({ issuedAt, retryAfter: 60, now: issuedAt + 45_000 })).toBe(15);
    expect(resendRemaining({ issuedAt, retryAfter: 60, now: issuedAt + 61_000 })).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("test_format_countdown", () => {
    // 61 секунда — это 1:01, а не 1:1
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(61)).toBe("1:01");
  });
});
