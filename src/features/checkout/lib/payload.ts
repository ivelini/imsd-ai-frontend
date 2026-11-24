/**
 * Тело POST /api/checkout: данные черновика + код. Позиции не передаются —
 * состав и цены сервер берёт из текущей корзины.
 */
import type {
  CheckoutAddressPayload,
  CheckoutDraft,
  CheckoutPayload,
  DeliveryAddress,
} from "@/features/checkout/types";

export function buildCheckoutPayload(draft: CheckoutDraft, code: string): CheckoutPayload {
  const payload: CheckoutPayload = {
    city: draft.city,
    customer_name: draft.customerName,
    customer_phone: draft.phone,
    customer_phone_code: code,
    customer_email: draft.email === "" ? null : draft.email,
    delivery_type: draft.deliveryType,
    payment_method: draft.paymentMethod,
    offer_accepted: true,
    privacy_accepted: true,
  };

  if (draft.deliveryType === "pickup") {
    payload.pickup_point_id = requirePickupPoint(draft);

    return payload;
  }

  payload.delivery_address = toAddressPayload(draft.deliveryAddress);

  return payload;
}

function requirePickupPoint(draft: CheckoutDraft): number {
  if (draft.pickupPointId === null) {
    throw new Error("Не выбрана точка самовывоза");
  }

  return draft.pickupPointId;
}

/** Пустые необязательные поля не отправляем: пустая строка — не отсутствие значения. */
function toAddressPayload(address: DeliveryAddress | null): CheckoutAddressPayload {
  if (address === null) {
    throw new Error("Не заполнен адрес доставки");
  }

  const payload: CheckoutAddressPayload = {
    city: address.city.trim(),
    street: address.street.trim(),
    house: address.house.trim(),
  };
  const apartment = address.apartment.trim();
  const comment = address.comment.trim();

  if (apartment !== "") payload.apartment = apartment;
  if (comment !== "") payload.comment = comment;

  return payload;
}
