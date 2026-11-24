// Id устройства гостя: создаётся один раз и переживает перезагрузку
import { describe, expect, it } from "vitest";

import { DEVICE_ID_KEY, getOrCreateDeviceId } from "@/shared/lib/deviceId";

function memoryStorage(initial: string | null = null) {
  const values = new Map<string, string>();

  if (initial !== null) values.set(DEVICE_ID_KEY, initial);

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, next: string) => {
      values.set(key, next);
    },
  };
}

describe("getOrCreateDeviceId", () => {
  it("test_device_id_is_created_once", () => {
    // второй вызов берёт сохранённое значение и не зовёт генератор
    const storage = memoryStorage();

    expect(getOrCreateDeviceId(storage, () => "dev-1")).toBe("dev-1");
    expect(storage.getItem(DEVICE_ID_KEY)).toBe("dev-1");
    expect(
      getOrCreateDeviceId(storage, () => {
        throw new Error("генератор не должен вызываться");
      }),
    ).toBe("dev-1");
  });
});
