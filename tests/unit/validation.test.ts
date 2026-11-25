// Клиентские правила форм: пароль ≥ 8 и совпадение, email необязателен, регистрация заполнена
import { describe, expect, it } from "vitest";

import {
  emailError,
  passwordError,
  validateRegister,
} from "@/shared/lib/validation";

describe("validation", () => {
  it("test_password_min_length", () => {
    // ровно 8 символов — допустимо, 7 — нет (граница min:8 из API)
    expect(passwordError("1234567", "1234567")).not.toBeNull();
    expect(passwordError("12345678", "12345678")).toBeNull();
  });

  it("test_password_confirmation_mismatch", () => {
    // пароль и подтверждение расходятся — ошибка
    expect(passwordError("12345678", "12345679")).not.toBeNull();
  });

  it("test_email_optional_and_format", () => {
    // пустой email допустим, заполненный проверяется форматом
    expect(emailError("")).toBeNull();
    expect(emailError("ivan@example.ru")).toBeNull();
    expect(emailError("abc")).not.toBeNull();
  });

  it("test_register_required_fields", () => {
    // имя, телефон, пароль и согласие обязательны; заполненная форма ошибок не даёт
    const errors = validateRegister({
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmation: "",
      agreement: false,
    });

    expect(errors.name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(errors.agreement).toBeTruthy();
    expect(errors.email).toBeUndefined();

    expect(
      validateRegister({
        name: "Иван",
        phone: "+7 951 123-45-67",
        email: "",
        password: "12345678",
        confirmation: "12345678",
        agreement: true,
      }),
    ).toEqual({});
  });
});
