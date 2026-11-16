// Ошибки чата → состояние экрана: различение по статусу и машинному коду, а не по тексту
// (тест-лист плана chat-live, тесты 1–5). Код отказа — `ai.off_topic`
import { describe, expect, it } from "vitest";

import { mapChatError } from "@/features/chat/lib/errors";

describe("mapChatError (ответ бэка → состояние экрана)", () => {
  it("test_off_topic_mapped_by_code", () => {
    // 400 различается кодом: текст «Тема не поддерживается» может быть переписан
    const result = mapChatError({
      status: 400,
      body: { message: "Тема не поддерживается", code: "ai.off_topic" },
    });

    expect(result.kind).toBe("off_topic");
    expect(result.message).toBe("Тема не поддерживается");
  });

  it("test_404_means_session_expired", () => {
    // неизвестный или протухший токен: экран сбрасывает диалог
    const result = mapChatError({ status: 404, body: { message: "Диалог не найден" } });

    expect(result.kind).toBe("session_expired");
  });

  it("test_429_shows_backend_message", () => {
    // лимит/бюджет: показываем текст бэка, а не общую ошибку
    const result = mapChatError({
      status: 429,
      body: { message: "Дневной лимит сообщений исчерпан" },
    });

    expect(result.kind).toBe("limit");
    expect(result.message).toBe("Дневной лимит сообщений исчерпан");
  });

  it("test_422_hides_validation_keys", () => {
    // технический ключ валидации на экран не пускаем — общий текст
    const result = mapChatError({
      status: 422,
      body: { message: "validation.max", errors: { message: ["max"] } },
    });

    expect(result.kind).toBe("invalid");
    expect(result.message).not.toBe("validation.max");
    expect(result.message).not.toContain("validation");
  });

  it("test_network_and_5xx_are_unavailable", () => {
    const network = mapChatError({ status: 0, body: null });
    const server = mapChatError({ status: 500, body: null });

    expect(network.kind).toBe("unavailable");
    expect(server.kind).toBe("unavailable");
    expect(server.message).toBe("Сервис временно недоступен");
  });
});
