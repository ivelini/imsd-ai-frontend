/**
 * Bearer-токен клиента: «Запомнить меня» хранит токен в localStorage, без галочки —
 * в sessionStorage (живёт до закрытия вкладки). Чтение предпочитает токен вкладки,
 * затем постоянный: после входа без галочки старый постоянный токен не маскирует новый.
 */
export const AUTH_TOKEN_KEY = "auth-token";

export interface TokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TokenStorages {
  session: TokenStorage;
  local: TokenStorage;
}

export function readAuthToken(storages: TokenStorages): string | null {
  const token =
    storages.session.getItem(AUTH_TOKEN_KEY) ?? storages.local.getItem(AUTH_TOKEN_KEY);

  return token === null || token.length === 0 ? null : token;
}

export function saveAuthToken(
  storages: TokenStorages,
  token: string,
  remember: boolean,
): void {
  if (token.length === 0) {
    clearAuthToken(storages);

    return;
  }

  const target = remember ? storages.local : storages.session;
  const other = remember ? storages.session : storages.local;

  target.setItem(AUTH_TOKEN_KEY, token);
  other.removeItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken(storages: TokenStorages): void {
  storages.session.removeItem(AUTH_TOKEN_KEY);
  storages.local.removeItem(AUTH_TOKEN_KEY);
}

/** Хранилища браузера; на сервере токена нет — только чтение, пустой результат. */
export function browserTokenStorages(): TokenStorages | null {
  if (typeof window === "undefined") return null;

  return { session: window.sessionStorage, local: window.localStorage };
}

/** Токен для заголовка Authorization; вне браузера — null. */
export function browserAuthToken(): string | null {
  const storages = browserTokenStorages();

  return storages === null ? null : readAuthToken(storages);
}
