// Общий мок fetch для unit-тестов API-адаптеров: ответ по URL (и init) → { status, body }.
import { vi } from "vitest";

export function mockFetch(
  handler: (url: string, init?: RequestInit) => { status: number; body?: unknown },
) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const { status, body } = handler(String(url), init);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
