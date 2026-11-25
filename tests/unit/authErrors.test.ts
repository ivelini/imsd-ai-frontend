// Отказы аккаунта: машинный код → состояние экрана, кулдаун, throttle без кода
import { describe, expect, it } from "vitest";

import { mapAuthError } from "@/shared/api/authErrors";
import { DEFAULT_API_ERROR_MESSAGE } from "@/shared/api/http";

describe("mapAuthError", () => {
  it("test_map_code_errors", () => {
    // неверный, истёкший и использованный код — разные состояния, хотя статус один
    expect(mapAuthError({ status: 422, body: { code: "auth.code_invalid" } }).state).toBe(
      "code_invalid",
    );
    expect(mapAuthError({ status: 422, body: { code: "auth.code_expired" } }).state).toBe(
      "code_expired",
    );
    expect(mapAuthError({ status: 422, body: { code: "auth.code_used" } }).state).toBe(
      "code_used",
    );
  });

  it("test_cooldown_returns_retry_after", () => {
    // остаток кулдауна — из тела 429, а не из константы фронта
    const result = mapAuthError({
      status: 429,
      body: { code: "auth.code_cooldown", retry_after: 37, message: "Код уже отправлен" },
    });

    expect(result.state).toBe("cooldown");
    expect(result.retryAfter).toBe(37);
  });

  it("test_credentials_invalid_message", () => {
    // текст отказа — русский текст бэка
    const result = mapAuthError({
      status: 422,
      body: { code: "auth.credentials_invalid", message: "Неверный телефон или пароль" },
    });

    expect(result.state).toBe("credentials_invalid");
    expect(result.message).toBe("Неверный телефон или пароль");
  });

  it("test_validation_error_hides_backend_message", () => {
    // ошибка валидации приходит без кода, её message — технический ключ: на экран нельзя
    const result = mapAuthError({
      status: 422,
      body: { message: "validation.required", errors: { phone: ["Обязательное поле"] } },
    });

    expect(result.state).toBe("unknown");
    expect(result.message).toBe(DEFAULT_API_ERROR_MESSAGE);
  });

  it("test_throttle_without_code_ru_fallback", () => {
    // 429 без машинного кода (throttle Laravel) не показывает английский текст
    const result = mapAuthError({ status: 429, body: { message: "Too Many Attempts." } });

    expect(result.state).toBe("throttle");
    expect(result.message).not.toContain("Too Many");
  });

  it("test_unknown_code", () => {
    // неизвестный код сводится к unknown без падения
    expect(mapAuthError({ status: 422, body: { code: "auth.new_code" } }).state).toBe(
      "unknown",
    );
  });
});
