// Тело подтверждения заказа: самовывоз/курьер, согласия, пустые поля адреса
import { describe, expect, it } from "vitest";

import { buildCheckoutPayload } from "@/features/checkout/lib/payload";
import type { CheckoutDraft } from "@/features/checkout/types";

const pickupDraft: CheckoutDraft = {
  idempotencyKey: "uuid-1",
  city: "cheljabinsk",
  customerName: "Иван Петров",
  phone: "+7 (351) 123-45-67",
  email: "",
  deliveryType: "pickup",
  pickupPointId: 3,
  pickupPointAddress: "Свердловский тракт, 3-н",
  deliveryAddress: null,
  paymentMethod: "cash_on_delivery",
  codeIssuedAt: null,
  codeRetryAfter: null,
};

describe("buildCheckoutPayload", () => {
  it("test_pickup_payload_has_point_and_consents", () => {
    // самовывоз: точка обязательна, адрес курьера не отправляется, согласия всегда true
    const payload = buildCheckoutPayload(pickupDraft, "1234");

    expect(payload.pickup_point_id).toBe(3);
    expect(payload).not.toHaveProperty("delivery_address");
    expect(payload.offer_accepted).toBe(true);
    expect(payload.privacy_accepted).toBe(true);
    expect(payload.customer_phone_code).toBe("1234");
    expect(payload.city).toBe("cheljabinsk");
  });

  it("test_courier_payload_omits_empty_address_fields", () => {
    // пустая квартира не превращается в пустую строку — ключа в теле нет
    const payload = buildCheckoutPayload(
      {
        ...pickupDraft,
        deliveryType: "courier",
        pickupPointId: null,
        pickupPointAddress: null,
        deliveryAddress: {
          city: "Челябинск",
          street: "Ленина",
          house: "1",
          apartment: "",
          comment: "",
        },
      },
      "1234",
    );

    expect(payload.delivery_address).toEqual({
      city: "Челябинск",
      street: "Ленина",
      house: "1",
    });
    expect(payload).not.toHaveProperty("pickup_point_id");
  });
});
