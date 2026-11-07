// Общий мок fetch для unit-тестов API-адаптеров: ответ по URL → { status, body }.
import { vi } from "vitest";

export function mockFetch(handler: (url: string) => { status: number; body?: unknown }) {
  const fn = vi.fn(async (url: string) => {
    const { status, body } = handler(String(url));
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
