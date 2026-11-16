// Поллинг чата: ждём ответ ассистента и ограничиваем ожидание 60 секундами
// (тест-лист плана chat-live, тесты 8–10)
import { describe, expect, it } from "vitest";

import { isWaitTimedOut, shouldPoll } from "@/features/chat/lib/polling";

const USER_AT_10 = [{ role: "user" as const, created_at: "2026-11-13T10:00:00+00:00" }];
const ANSWERED = [
  { role: "user" as const, created_at: "2026-11-13T10:00:00+00:00" },
  { role: "assistant" as const, created_at: "2026-11-13T10:00:04+00:00" },
];

/** Момент времени: секунды после первого вопроса (10:00:00Z) */
function at(seconds: number): number {
  return Date.parse("2026-11-13T10:00:00+00:00") + seconds * 1000;
}

describe("shouldPoll (ждём ответ ассистента)", () => {
  it("test_poll_while_waiting_for_assistant", () => {
    expect(shouldPoll(USER_AT_10, at(30), 0)).toBe(true);
  });

  it("test_stop_after_answer_or_timeout", () => {
    expect(shouldPoll(ANSWERED, at(30), 0)).toBe(false);
    // граница 60 000 мс: на последней секунде опрос ещё идёт, после — выключен
    expect(shouldPoll(USER_AT_10, at(60), 0)).toBe(true);
    expect(shouldPoll(USER_AT_10, at(60) + 1, 0)).toBe(false);
    expect(isWaitTimedOut(USER_AT_10, at(60) + 1, 0)).toBe(true);
  });

  it("test_retry_extends_polling_window", () => {
    // «Повторить» открывает новое окно ожидания — таймаут снят, опрос возобновлён
    const now = at(61);

    expect(shouldPoll(USER_AT_10, now, now + 60_000)).toBe(true);
    expect(isWaitTimedOut(USER_AT_10, now, now + 60_000)).toBe(false);
  });
});
