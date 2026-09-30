/**
 * Черновик записи и снимок созданной записи — в sessionStorage.
 *
 * Черновик не в URL: имя и телефон утекли бы в историю браузера, реферер и логи.
 * sessionStorage, а не localStorage: закрыл вкладку — данные ушли.
 *
 * Хранилище читается через useSyncExternalStore: оно внешнее по отношению к React,
 * а setState в эффекте для такого чтения линтер проекта запрещает.
 */
import type { BookingDto } from "@/shared/api/booking";
import type { BookingDraft } from "@/features/booking/types";

const DRAFT_KEY = "booking-draft";
const SNAPSHOT_KEY = "booking-snapshot";

export interface StorageStore<T> {
  subscribe: (listener: () => void) => () => void;
  /** null — записи нет (и на сервере, и в браузере до первого сохранения) */
  getSnapshot: () => T | null;
  getServerSnapshot: () => T | null;
  write: (value: T) => void;
  clear: () => void;
}

function createStorageStore<T>(key: string): StorageStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: T | null = null;

  return {
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    /**
     * Кеш по сырой строке: useSyncExternalStore требует стабильной ссылки на снимок,
     * а JSON.parse при каждом вызове давал бы новый объект и зацикливал рендер.
     */
    getSnapshot() {
      const raw = typeof window === "undefined" ? null : window.sessionStorage.getItem(key);

      if (raw !== cachedRaw) {
        cachedRaw = raw;
        cached = raw === null ? null : parse<T>(raw);
      }

      return cached;
    },

    getServerSnapshot: () => null,

    write(value) {
      if (typeof window === "undefined") return;

      window.sessionStorage.setItem(key, JSON.stringify(value));
      listeners.forEach((listener) => listener());
    },

    clear() {
      if (typeof window === "undefined") return;

      window.sessionStorage.removeItem(key);
      listeners.forEach((listener) => listener());
    },
  };
}

function parse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // повреждённая запись — считаем, что её нет, и уводим на шаг 1
    return null;
  }
}

export const draftStore = createStorageStore<BookingDraft>(DRAFT_KEY);
export const snapshotStore = createStorageStore<BookingDto>(SNAPSHOT_KEY);
