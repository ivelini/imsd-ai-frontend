// Черновик заказа: склейка ФИО, ключ идемпотентности, готовность шага кода
import { describe, expect, it } from "vitest";

import { createCheckoutDraft, isDraftReady } from "@/features/checkout/lib/draft";
import type { CheckoutFormInput } from "@/features/checkout/types";

const input: CheckoutFormInput = {
  lastName: " Петров ",
  firstName: "Иван",
  middleName: "",
  phone: "+7 (351) 123-45-67",
  email: "",
  deliveryType: "pickup",
  pickupPointId: 3,
  pickupPointAddress: "Свердловский тракт, 3-н",
  deliveryAddress: null,
  paymentMethod: "cash_on_delivery",
};

describe("createCheckoutDraft", () => {
  it("test_draft_joins_name_and_keeps_key", () => {
    // ФИО склеивается без лишних пробелов; ключ и город живут в черновике
    const draft = createCheckoutDraft(input, "uuid-1", "cheljabinsk");

    expect(draft.customerName).toBe("Петров Иван");
    expect(draft.idempotencyKey).toBe("uuid-1");
    expect(draft.city).toBe("cheljabinsk");
  });
});

describe("isDraftReady (шаг кода без черновика)", () => {
  it("test_draft_requires_phone", () => {
    // прямой заход на /checkout/code без телефона уводит на форму
    const withoutPhone = createCheckoutDraft({ ...input, phone: "" }, "uuid-1", "cheljabinsk");
    const withPhone = createCheckoutDraft(input, "uuid-1", "cheljabinsk");

    expect(isDraftReady(withoutPhone)).toBe(false);
    expect(isDraftReady(withPhone)).toBe(true);
  });
});
