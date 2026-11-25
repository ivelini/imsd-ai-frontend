/** Куда вернуть после входа по умолчанию — личный кабинет. */
export const AFTER_AUTH_PATH = "/account/profile";

/**
 * Параметр `next` после входа: только внутренний путь. Протокол-относительный
 * (`//evil.com`) и абсолютный URL — открытый редирект, поэтому подменяются профилем.
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (typeof raw !== "string" || raw.length === 0) return AFTER_AUTH_PATH;

  if (!raw.startsWith("/") || raw.startsWith("//")) return AFTER_AUTH_PATH;

  return raw;
}
