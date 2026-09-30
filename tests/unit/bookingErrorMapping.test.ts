// Ошибки бэка записи → состояние экрана: различение по машинному коду, фолбэк на общий
// (тест-лист плана booking-react-port, тесты 9–11). Коды — BookingErrorCode бэка (`booking.*`)
import { describe, expect, it } from "vitest";

import { mapBookingError } from "@/features/booking/lib/errors";

describe("mapBookingError (ответ бэка → состояние экрана)", () => {
  it("test_error_code_wins_over_message", () => {
    // тексты совпадают, различает только код: по тексту ветвиться нельзя
    const expired = mapBookingError({
      status: 409,
      body: { message: "Код не подошёл", code: "booking.code_expired" },
    });
    const taken = mapBookingError({
      status: 409,
      body: { message: "Код не подошёл", code: "booking.slot_time_taken" },
    });

    expect(expired.state).toBe("code_expired");
    expect(taken.state).toBe("slot_taken");
    expect(expired.state).not.toBe(taken.state);
  });

  it("test_catalog_pricing_error_is_distinguishable", () => {
    // 422 каталога на редкой паре радиус+тип: шаг услуг обязан предложить сменить параметры
    const result = mapBookingError({
      status: 422,
      body: { message: "Нет прайс-правила для выбранных параметров", code: "booking.price_rule_missing" },
    });

    expect(result.state).toBe("pricing_missing");
  });

  it("test_unknown_error_falls_back", () => {
    const withoutBody = mapBookingError({ status: 500, body: null });

    expect(withoutBody.state).toBe("unknown");
    expect(withoutBody.message.length).toBeGreaterThan(0);

    const withMessage = mapBookingError({ status: 500, body: { message: "Сервис недоступен" } });

    expect(withMessage.message).toBe("Сервис недоступен");
  });
});
