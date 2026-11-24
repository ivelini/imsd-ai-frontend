/**
 * Постоянный id устройства гостя: по нему бэк узнаёт корзину и заказы без токена
 * (заголовок X-Device-Id, 1–64 символа). Живёт в localStorage — переживает
 * перезагрузку и работает во всех вкладках.
 */
export const DEVICE_ID_KEY = "device-id";

const MAX_LENGTH = 64;

interface DeviceStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export function getOrCreateDeviceId(storage: DeviceStorage, generate: () => string): string {
  const stored = storage.getItem(DEVICE_ID_KEY);

  if (stored !== null && stored.length > 0 && stored.length <= MAX_LENGTH) {
    return stored;
  }

  const created = generate();

  if (created.length === 0 || created.length > MAX_LENGTH) {
    throw new Error("Id устройства должен быть длиной от 1 до 64 символов");
  }

  storage.setItem(DEVICE_ID_KEY, created);

  return created;
}

/** Id для заголовка X-Device-Id; на сервере — пустая строка (запросы корзины клиентские). */
export function browserDeviceId(): string {
  if (typeof window === "undefined") return "";

  return getOrCreateDeviceId(window.localStorage, () => crypto.randomUUID());
}
