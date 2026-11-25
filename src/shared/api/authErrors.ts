/**
 * Отказы аккаунта (`auth.*`) → состояние экрана. Общие для входа, регистрации,
 * восстановления пароля и профиля: коды одни и те же.
 */
import type { DomainErrorResult } from "./domainError";
import { mapDomainError } from "./domainError";
import type { ApiErrorResponse } from "./http";

export type AuthErrorState =
  | "credentials_invalid"
  | "phone_taken"
  | "email_taken"
  | "phone_invalid"
  | "code_invalid"
  | "code_expired"
  | "code_used"
  | "cooldown"
  | "reset_token_invalid"
  | "throttle"
  | "unknown";

export type AuthErrorResult = DomainErrorResult<AuthErrorState>;

/** Отказ кода подтверждения: на экране очищают введённые цифры. */
export function isCodeError(state: AuthErrorState): boolean {
  return state === "code_invalid" || state === "code_expired" || state === "code_used";
}

const STATES_BY_CODE: Record<string, AuthErrorState> = {
  "auth.credentials_invalid": "credentials_invalid",
  "auth.phone_taken": "phone_taken",
  "auth.email_taken": "email_taken",
  "auth.phone_invalid": "phone_invalid",
  "auth.code_invalid": "code_invalid",
  "auth.code_expired": "code_expired",
  "auth.code_used": "code_used",
  "auth.code_cooldown": "cooldown",
  "auth.reset_token_invalid": "reset_token_invalid",
};

/** 429 без машинного кода — throttle Laravel: английский текст на экран не пускаем. */
const THROTTLE_MESSAGE = "Слишком много попыток. Попробуйте позже";

export function mapAuthError(response: ApiErrorResponse): AuthErrorResult {
  const result = mapDomainError(response, STATES_BY_CODE);

  if (result.state === "unknown" && response.status === 429) {
    return { state: "throttle", message: THROTTLE_MESSAGE };
  }

  return result;
}
