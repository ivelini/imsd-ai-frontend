// Снимок заказа для страницы успеха: суммы сервера, подписи справочника, адрес
import { describe, expect, it } from "vitest";

import { buildOrderSnapshot } from "@/features/checkout/lib/snapshot";
import type {
  CheckoutDraft,
  CheckoutReference,
  OrderDto,
} from "@/features/checkout/types";

const reference: CheckoutReference = {
  delivery: [
    {
      value: "pickup",
      label: "Самовывоз",
      requiresPickupPoint: true,
      requiresAddress: false,
    },
  ],
  payment: [{ value: "cash_on_delivery", label: "Наличные при получении" }],
  codeTtlMin: 15,
};

const order: OrderDto = {
  id: 12,
  user_id: 5,
  status: "new",
  payment_status: "unpaid",
  payment_method: "cash_on_delivery",
  delivery_type: "pickup",
  city_id: 1,
  pickup_point_id: 3,
  delivery_address: null,
  track_number: null,
  comment: null,
  subtotal: 40400,
  discount: 0,
  delivery_cost: 0,
  total: 40400,
  items: [
    {
      id: 1,
      itemable_type: "tire",
      itemable_id: 10,
      name: "Шина",
      quantity: 4,
      unit_price: 10100,
      total: 40400,
    },
  ],
  created_at: "2026-11-24T12:00:00+05:00",
};

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

describe("buildOrderSnapshot", () => {
  it("test_snapshot_uses_server_totals_and_reference_labels", () => {
    // суммы и позиции — из ответа заказа; подписи — из справочника; машинный статус не переводим
    const snapshot = buildOrderSnapshot(order, pickupDraft, reference);

    expect(snapshot.total).toBe(40400);
    expect(snapshot.deliveryLabel).toBe("Самовывоз");
    expect(snapshot.pickupAddress).toBe("Свердловский тракт, 3-н");
    expect(snapshot.paymentLabel).toBe("Наличные при получении");
    expect("statusLabel" in snapshot).toBe(false);
  });

  it("test_courier_snapshot_address_without_apartment", () => {
    // пустая квартира не оставляет лишней запятой в адресе
    const snapshot = buildOrderSnapshot(
      order,
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
      reference,
    );

    expect(snapshot.deliveryAddress).toBe("Челябинск, Ленина 1");
  });
});
