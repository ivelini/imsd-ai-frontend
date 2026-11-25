// Аутентификация клиента: регистрация по SMS-коду, вход/выход, восстановление пароля.
// Контракт — ../backend/documentations/api-maps/account-frontend.md (24.11.2026);
// источник истины — Scramble public-api.json.
import type {
  Client,
  ClientDto,
  ClientLogin,
  ClientLoginDto,
  LoginInput,
  RegisterInput,
  ResetEmailInput,
  ResetSmsInput,
} from "@/features/auth/types";
import { browserDeviceId } from "@/shared/lib/deviceId";
import { authHeaders, fetchJson, unwrapData } from "./http";

/** DTO клиента бэка (`full_name`) → тип фронта (`fullName`). */
export function toClient(dto: ClientDto): Client {
  return {
    id: dto.id,
    name: dto.name,
    surname: dto.surname,
    patronymic: dto.patronymic,
    fullName: dto.full_name,
    phone: dto.phone,
    email: dto.email,
  };
}

/** JSON-заголовки; при входе/регистрации — ещё и X-Device-Id для слияния гостевой корзины. */
function jsonHeaders(withDeviceId: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (withDeviceId) headers["X-Device-Id"] = browserDeviceId();

  return headers;
}

function toLogin(body: unknown): ClientLogin {
  const dto = unwrapData<ClientLoginDto>(body);

  return { token: dto.token, client: toClient(dto.client) };
}

export async function login(input: LoginInput): Promise<ClientLogin> {
  const body = await fetchJson("/auth/login", {
    method: "POST",
    headers: jsonHeaders(true),
    body: JSON.stringify(input),
  });

  return toLogin(body);
}

/** Код регистрации на телефон; `retry_after` — длительность кулдауна повторной отправки. */
export async function requestRegisterCode(phone: string): Promise<{ retryAfter: number }> {
  const body = await fetchJson("/auth/register/code", {
    method: "POST",
    headers: jsonHeaders(false),
    body: JSON.stringify({ phone }),
  });

  return { retryAfter: unwrapData<{ retry_after: number }>(body).retry_after };
}

export async function register(input: RegisterInput): Promise<ClientLogin> {
  const body = await fetchJson("/auth/register", {
    method: "POST",
    headers: jsonHeaders(true),
    body: JSON.stringify({
      phone: input.phone,
      name: input.name,
      email: input.email,
      password: input.password,
      password_confirmation: input.confirmation,
      code: input.code,
    }),
  });

  return toLogin(body);
}

export async function logout(): Promise<void> {
  await fetchJson("/auth/logout", {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
  });
}

export async function forgotPasswordSms(phone: string): Promise<{ retryAfter: number }> {
  const body = await fetchJson("/auth/password/forgot/sms", {
    method: "POST",
    headers: jsonHeaders(false),
    body: JSON.stringify({ phone }),
  });

  return { retryAfter: unwrapData<{ retry_after: number }>(body).retry_after };
}

/** Ссылка сброса уходит письмом; ответ одинаковый для любой карточки (не раскрываем). */
export async function forgotPasswordEmail(email: string): Promise<string> {
  const body = await fetchJson("/auth/password/forgot/email", {
    method: "POST",
    headers: jsonHeaders(false),
    body: JSON.stringify({ email }),
  });

  return (body as { message: string }).message;
}

export async function resetPasswordSms(input: ResetSmsInput): Promise<string> {
  const body = await fetchJson("/auth/password/reset/sms", {
    method: "POST",
    headers: jsonHeaders(false),
    body: JSON.stringify({
      phone: input.phone,
      code: input.code,
      password: input.password,
      password_confirmation: input.confirmation,
    }),
  });

  return (body as { message: string }).message;
}

export async function resetPasswordEmail(input: ResetEmailInput): Promise<string> {
  const body = await fetchJson("/auth/password/reset/email", {
    method: "POST",
    headers: jsonHeaders(false),
    body: JSON.stringify({
      email: input.email,
      token: input.token,
      password: input.password,
      password_confirmation: input.confirmation,
    }),
  });

  return (body as { message: string }).message;
}
