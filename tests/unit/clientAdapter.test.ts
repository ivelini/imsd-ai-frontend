// DTO клиента бэка (snake_case) → тип фронта Client (camelCase)
import { describe, expect, it } from "vitest";

import { toClient } from "@/shared/api/auth";
import type { ClientDto } from "@/features/auth/types";

describe("toClient", () => {
  it("test_map_client_dto", () => {
    // full_name бэка становится fullName; остальные поля — как есть
    const dto: ClientDto = {
      id: 7,
      name: "Иван",
      surname: "Иванов",
      patronymic: "Иванович",
      full_name: "Иванов Иван Иванович",
      phone: "79511234567",
      email: "ivan@example.ru",
    };

    const client = toClient(dto);

    expect(client.fullName).toBe("Иванов Иван Иванович");
    expect(client.id).toBe(7);
    expect(client.email).toBe("ivan@example.ru");
  });

  it("test_map_keeps_nulls", () => {
    // необязательные поля не превращаются в пустые строки
    const client = toClient({
      id: 8,
      name: "Пётр",
      surname: null,
      patronymic: null,
      full_name: "Пётр",
      phone: null,
      email: null,
    });

    expect(client.surname).toBeNull();
    expect(client.patronymic).toBeNull();
    expect(client.phone).toBeNull();
    expect(client.email).toBeNull();
  });
});
