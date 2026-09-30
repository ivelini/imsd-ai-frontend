// Тело запроса на подтверждение записи: quantities объектом с ключом service_id,
// обязательные ключи в теле (тест-лист плана booking-react-port, тесты 7–8)
import { describe, expect, it } from "vitest";

import { buildConfirmPayload } from "@/features/booking/lib/payload";
import type { BookingDraft } from "@/features/booking/types";

const draft: BookingDraft = {
  date: "2026-09-16",
  hour: 15,
  radius: 16,
  carType: "passenger",
  services: [
    { id: 12, quantity: 4 },
    { id: 15, quantity: 2 },
  ],
  name: "Иван",
  phone: "+7 999 000-00-00",
  plate: null,
  codeIssuedAt: null,
  codeRetryAfter: null,
};

describe("buildConfirmPayload (тело POST /booking/confirm)", () => {
  it("test_quantities_sent_keyed_by_service_id", () => {
    // массивом бэк молча подставит количество 1 каждой услуге и цена уедет без ошибки
    const body = buildConfirmPayload(draft, "1234");

    expect(body.quantities).toEqual({ 12: 4, 15: 2 });
    expect(body.service_ids).toEqual([12, 15]);
  });

  it("test_optional_keys_present_as_null", () => {
    // контроллер читает оба ключа безусловно: пропуск даёт 500, а не 422
    const body = buildConfirmPayload({ ...draft, plate: null }, "1234");

    expect(Object.keys(body)).toContain("plate");
    expect(Object.keys(body)).toContain("quantities");
    expect(body.plate).toBeNull();
  });
});
