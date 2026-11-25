// Личный кабинет: сессия, профиль, телефон и настройки уведомлений (Bearer).
// Контракт — ../backend/documentations/api-maps/account-frontend.md (24.11.2026).
import type { Client, ClientDto } from "@/features/auth/types";
import type {
  ChangePhoneInput,
  NotificationSettingDto,
  ProfileInput,
} from "@/features/account/types";
import {
  browserTokenStorages,
  clearAuthToken,
  readAuthToken,
} from "@/shared/lib/authToken";
import { toClient } from "./auth";
import { ApiError, authHeaders, fetchJson, unwrapData } from "./http";

export async function getProfile(): Promise<Client> {
  const body = await fetchJson("/account/profile", { headers: authHeaders() });

  return toClient(unwrapData<ClientDto>(body));
}

/**
 * Сессия для экранов: без токена — null; токен не принят (401) — сброс и null.
 * Сетевой отказ пробрасывается: это не «гость», а неизвестность.
 */
export async function getSession(): Promise<Client | null> {
  const storages = browserTokenStorages();

  if (storages === null || readAuthToken(storages) === null) return null;

  try {
    return await getProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthToken(storages);

      return null;
    }

    throw error;
  }
}

export async function updateProfile(input: ProfileInput): Promise<Client> {
  const body = await fetchJson("/account/profile", {
    method: "PATCH",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });

  return toClient(unwrapData<ClientDto>(body));
}

export async function requestProfilePhoneCode(
  phone: string,
): Promise<{ retryAfter: number }> {
  const body = await fetchJson("/account/profile/phone/code", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ phone }),
  });

  return { retryAfter: unwrapData<{ retry_after: number }>(body).retry_after };
}

export async function changeProfilePhone(input: ChangePhoneInput): Promise<Client> {
  const body = await fetchJson("/account/profile/phone", {
    method: "PATCH",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });

  return toClient(unwrapData<ClientDto>(body));
}

export async function getNotificationSettings(): Promise<NotificationSettingDto[]> {
  const body = await fetchJson("/account/notification-settings", { headers: authHeaders() });

  return unwrapData<NotificationSettingDto[]>(body);
}

export async function saveNotificationSettings(
  settings: NotificationSettingDto[],
): Promise<NotificationSettingDto[]> {
  const body = await fetchJson("/account/notification-settings", {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ settings }),
  });

  return unwrapData<NotificationSettingDto[]>(body);
}
