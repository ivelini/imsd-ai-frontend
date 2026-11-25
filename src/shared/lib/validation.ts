/**
 * Клиентские правила форм аккаунта: подсказки до запроса. Финальная валидация —
 * на бэке; здесь только то, что видно пользователю сразу.
 */
export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Пароль ≥ 8 символов (граница API `min:8`) и совпадение с подтверждением. */
export function passwordError(password: string, confirmation: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Минимум ${PASSWORD_MIN_LENGTH} символов`;
  }

  if (password !== confirmation) {
    return "Пароли не совпадают";
  }

  return null;
}

/** Email необязателен: пустой — ок, заполненный проверяется форматом. */
export function emailError(email: string): string | null {
  if (email.trim().length === 0) return null;

  return EMAIL_PATTERN.test(email.trim()) ? null : "Некорректный e-mail";
}

export type RegisterField = "name" | "phone" | "email" | "password" | "agreement";

export type FieldErrors = Partial<Record<RegisterField, string>>;

export interface RegisterFields {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmation: string;
  agreement: boolean;
}

export function validateRegister(fields: RegisterFields): FieldErrors {
  const errors: FieldErrors = {};

  if (fields.name.trim().length === 0) errors.name = "Укажите имя";
  if (fields.phone.trim().length === 0) errors.phone = "Укажите телефон";

  const email = emailError(fields.email);
  if (email !== null) errors.email = email;

  const password = passwordError(fields.password, fields.confirmation);
  if (password !== null) errors.password = password;

  if (!fields.agreement) errors.agreement = "Нужно согласие с политикой";

  return errors;
}

export interface ProfileFields {
  name: string;
  email: string;
}

export function validateProfile(fields: ProfileFields): FieldErrors {
  const errors: FieldErrors = {};

  if (fields.name.trim().length === 0) errors.name = "Укажите имя";

  const email = emailError(fields.email);
  if (email !== null) errors.email = email;

  return errors;
}
