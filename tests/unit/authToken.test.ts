// Токен сессии: «Запомнить меня» = localStorage, иначе sessionStorage; чтение — session → local
import { describe, expect, it } from "vitest";

import {
  clearAuthToken,
  readAuthToken,
  saveAuthToken,
  type TokenStorage,
  type TokenStorages,
} from "@/shared/lib/authToken";

const KEY = "auth-token";

function storage(initial: Record<string, string> = {}): TokenStorage {
  const values = new Map(Object.entries(initial));

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

function storages(
  session: Record<string, string> = {},
  local: Record<string, string> = {},
): TokenStorages {
  return { session: storage(session), local: storage(local) };
}

describe("authToken", () => {
  it("test_save_remember_to_local", () => {
    // галочка «Запомнить меня»: токен в localStorage, из sessionStorage убран
    const target = storages({ [KEY]: "old" });

    saveAuthToken(target, "new", true);

    expect(target.local.getItem(KEY)).toBe("new");
    expect(target.session.getItem(KEY)).toBeNull();
  });

  it("test_save_without_remember_to_session", () => {
    // без галочки токен живёт только во вкладке, старый из localStorage убран
    const target = storages({}, { [KEY]: "old" });

    saveAuthToken(target, "new", false);

    expect(target.session.getItem(KEY)).toBe("new");
    expect(target.local.getItem(KEY)).toBeNull();
  });

  it("test_read_prefers_session_token", () => {
    // токен вкладки свежее: читаем его, затем localStorage
    const both = storages({ [KEY]: "s" }, { [KEY]: "l" });
    const localOnly = storages({}, { [KEY]: "l" });
    const empty = storages();

    expect(readAuthToken(both)).toBe("s");
    expect(readAuthToken(localOnly)).toBe("l");
    expect(readAuthToken(empty)).toBeNull();
  });

  it("test_clear_and_ignore_empty", () => {
    // выход чистит оба хранилища; пустой токен не записывается
    const target = storages({ [KEY]: "s" }, { [KEY]: "l" });

    clearAuthToken(target);
    saveAuthToken(target, "", true);

    expect(target.session.getItem(KEY)).toBeNull();
    expect(target.local.getItem(KEY)).toBeNull();
  });
});
