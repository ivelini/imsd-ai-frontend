// Отказы оформления: машинный код → состояние экрана, кулдаун, валидация
import { describe, expect, it } from "vitest";

import { mapCheckoutError } from "@/features/checkout/lib/errors";
import { DEFAULT_API_ERROR_MESSAGE } from "@/shared/api/http";

describe("mapCheckoutError", () => {
  it("test_map_phone_code_errors", () => {
    // неверный и истёкший код — разные состояния, хотя статус один
    expect(
      mapCheckoutError({ status: 422, body: { code: "checkout.phone_code_invalid" } }).state,
    ).toBe("code_invalid");
    expect(
      mapCheckoutError({ status: 422, body: { code: "checkout.phone_code_expired" } }).state,
    ).toBe("code_expired");
  });

  it("test_cooldown_returns_retry_after", () => {
    // остаток кулдауна — из тела 429, а не из константы фронта
    const result = mapCheckoutError({
      status: 429,
      body: { code: "checkout.code_cooldown", retry_after: 37, message: "Код уже отправлен" },
    });

    expect(result.state).toBe("cooldown");
    expect(result.retryAfter).toBe(37);
  });

  it("test_validation_error_hides_backend_message", () => {
    // ошибка валидации приходит без кода, её message — технический ключ: на экран нельзя
    const result = mapCheckoutError({
      status: 422,
      body: { message: "validation.required", errors: { phone: ["Обязательное поле"] } },
    });

    expect(result.state).toBe("unknown");
    expect(result.message).toBe(DEFAULT_API_ERROR_MESSAGE);
  });

  it("test_unknown_error_is_generic", () => {
    // нет тела и неизвестный код сводятся к общему состоянию без падения
    const noBody = mapCheckoutError({ status: 500, body: null });
    const newCode = mapCheckoutError({ status: 422, body: { code: "checkout.new_code" } });

    expect(noBody.state).toBe("unknown");
    expect(noBody.retryAfter).toBeUndefined();
    expect(newCode.state).toBe("unknown");
    expect(newCode.retryAfter).toBeUndefined();
  });
});
