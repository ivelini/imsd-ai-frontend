/**
 * Стор поверх sessionStorage для внешних по отношению к React данных (черновики,
 * снимки ответов). Чтение — через useSyncExternalStore: setState в эффекте линтер
 * проекта запрещает.
 */
export interface StorageStore<T> {
  subscribe: (listener: () => void) => () => void;
  /** null — записи нет (и на сервере, и в браузере до первого сохранения) */
  getSnapshot: () => T | null;
  getServerSnapshot: () => T | null;
  write: (value: T) => void;
  clear: () => void;
}

export function createStorageStore<T>(key: string): StorageStore<T> {
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
    // повреждённая запись — считаем, что её нет
    return null;
  }
}
