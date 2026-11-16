// Кликабельные варианты ответа: только у последней реплики ассистента
// (тест-лист плана chat-options, тесты 1–3)
import { describe, expect, it } from "vitest";

import { isCurrentLocation, lastOptions, visibleOptions } from "@/features/chat/lib/options";
import type { ChatMessageDto, ChatOptionDto } from "@/shared/api/chat";

function message(
  overrides: Partial<ChatMessageDto> & Pick<ChatMessageDto, "id" | "role">,
): ChatMessageDto {
  return { content: "", created_at: null, ...overrides };
}

const YEAR_OPTIONS: ChatOptionDto[] = [
  { label: "2013", text: "2013" },
  { label: "2012", text: "2012" },
];

describe("lastOptions (варианты ответа в ленте)", () => {
  it("test_options_only_from_last_message", () => {
    // после вопроса пользователя варианты прошлой реплики больше не показываются
    const messages = [
      message({ id: 1, role: "assistant", options: YEAR_OPTIONS }),
      message({ id: 2, role: "user", content: "2013" }),
    ];

    expect(lastOptions(messages)).toEqual([]);
  });

  it("test_last_assistant_options_returned", () => {
    // порядок и пара label/text отдаются как есть
    const messages = [
      message({ id: 1, role: "user" }),
      message({ id: 2, role: "assistant", content: "Уточните год выпуска", options: YEAR_OPTIONS }),
    ];

    const options = lastOptions(messages);

    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ label: "2013", text: "2013" });
  });

  it("test_no_options_returns_empty", () => {
    // ключа options нет или список пуст — кнопок нет
    expect(lastOptions([message({ id: 1, role: "assistant" })])).toEqual([]);
    expect(lastOptions([message({ id: 1, role: "assistant", options: [] })])).toEqual([]);
  });

  it("test_url_option_is_returned", () => {
    // у варианта-ссылки нет text — это не повод выбрасывать его из ленты
    const catalogOption: ChatOptionDto = {
      label: "Открыть каталог",
      url: "/catalog/tires/winter/w175/p65/r14?city=cheljabinsk",
    };
    const messages = [message({ id: 1, role: "assistant", options: [catalogOption] })];

    const options = lastOptions(messages);

    expect(options).toHaveLength(1);
    expect(options[0]).toEqual(catalogOption);
  });
});

describe("visibleOptions (варианты с учётом клика)", () => {
  it("test_dismissed_message_options_hidden", () => {
    // реплику уже кликнули — варианты больше не активны
    const messages = [message({ id: 7, role: "assistant", options: YEAR_OPTIONS })];

    expect(visibleOptions(messages, 7)).toEqual([]);
    expect(visibleOptions(messages, null)).toHaveLength(2);
  });
});

describe("isCurrentLocation (ссылка ведёт на текущий адрес)", () => {
  it("test_current_location_detection", () => {
    // совпадение — пустой push не обновит данные, нужен router.refresh
    expect(
      isCurrentLocation(
        "/catalog/tires/winter?city=cheljabinsk",
        "/catalog/tires/winter?city=cheljabinsk",
      ),
    ).toBe(true);

    expect(
      isCurrentLocation(
        "/catalog/tires/winter?city=cheljabinsk",
        "/catalog/tires/summer?city=cheljabinsk",
      ),
    ).toBe(false);
  });
});
