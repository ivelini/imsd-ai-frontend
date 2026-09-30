// Черновик записи: полнота, сброс кода при смене времени, остаток кулдауна
// (тест-лист плана booking-react-port, тесты 12–14)
import { describe, expect, it } from "vitest";

import { isComplete, resendRemaining, setTime } from "@/features/booking/lib/draft";
import type { BookingDraft } from "@/features/booking/types";

const empty: BookingDraft = {
  date: null,
  hour: null,
  radius: null,
  carType: null,
  services: [],
  name: "",
  phone: "",
  plate: null,
  codeIssuedAt: null,
  codeRetryAfter: null,
};

describe("isComplete (черновик заполнен)", () => {
  it("test_draft_without_time_is_incomplete", () => {
    // шаги 2–4 при пустом черновике уводят на шаг 1 — защита от прямого захода по адресу
    const withoutTime = { ...empty, services: [{ id: 12, quantity: 4 }], name: "Иван" };

    expect(isComplete(withoutTime)).toBe(false);
    expect(isComplete({ ...empty, date: "2026-09-16", hour: 15 })).toBe(true);
  });
});

describe("setTime (смена времени записи)", () => {
  it("test_changing_time_resets_issued_code", () => {
    // код выдан на прежнее время — иначе шаг 4 подтвердит запись кодом от другого часа
    const draft: BookingDraft = {
      ...empty,
      date: "2026-09-16",
      hour: 15,
      codeIssuedAt: 1_700_000_000_000,
    };

    const next = setTime(draft, "2026-09-17", 11);

    expect(next.codeIssuedAt).toBeNull();
    expect(next.date).toBe("2026-09-17");
    expect(next.hour).toBe(11);
  });
});

describe("resendRemaining (остаток до повторной отправки кода)", () => {
  it("test_resend_countdown_uses_backend_retry_after", () => {
    // retry_after бэка — длительность кулдауна от момента выдачи, а не остаток
    const issuedAt = 1_700_000_000_000;

    expect(resendRemaining({ issuedAt, retryAfter: 60, now: issuedAt + 45_000 })).toBe(15);
    expect(resendRemaining({ issuedAt, retryAfter: 60, now: issuedAt + 61_000 })).toBe(0);
  });
});
