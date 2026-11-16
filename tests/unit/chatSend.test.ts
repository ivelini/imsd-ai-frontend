// Отправка в чат: город уходит в теле POST слагом, пустой — не уходит
// (тест-лист плана chat-city, тесты 1–2). Без города бэк считает по городу магазина.
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockFetch } from "./helpers/mockFetch";
import { sendChatMessage } from "@/shared/api/chat";

const ACCEPTED = { session_token: "9b1f", message_id: 1, status: "accepted" };

function acceptFetch() {
  return mockFetch(() => ({ status: 202, body: ACCEPTED }));
}

describe("sendChatMessage: тело POST и город", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("test_send_payload_includes_city", async () => {
    const fetchMock = acceptFetch();

    await sendChatMessage({ message: "какие шины", city: "cheljabinsk", token: "9b1f-token" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url).endsWith("/chat")).toBe(true);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["X-Session-Token"]).toBe("9b1f-token");
    expect(JSON.parse(String(init?.body))).toEqual({ message: "какие шины", city: "cheljabinsk" });
  });

  it("test_send_payload_omits_empty_city", async () => {
    for (const city of ["", undefined]) {
      const fetchMock = acceptFetch();

      await sendChatMessage({ message: "какие шины", city });

      const init = fetchMock.mock.calls[0][1];
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      expect(body).toEqual({ message: "какие шины" });
      expect("city" in body).toBe(false);
    }
  });
});
