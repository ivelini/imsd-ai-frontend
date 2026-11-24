// Типы оформления заказа: DTO бэка (snake_case) и данные экранов.
// Контракт — ../backend/documentations/api-maps/checkout-frontend.md (24.11.2026).

// ============================================================================
// DTO бэкенда
// ============================================================================

/** Способ получения из GET /api/reference/checkout. */
export interface DeliveryOptionDto {
  value: string;
  label: string;
  requires_pickup_point: boolean;
  requires_address: boolean;
}

/** Способ оплаты из GET /api/reference/checkout (значение правит админка). */
export interface PaymentOptionDto {
  value: string;
  label: string;
}

export interface CheckoutReferenceDto {
  delivery: DeliveryOptionDto[];
  payment: PaymentOptionDto[];
  code_ttl_min: number;
}

/** Точка выдачи: GET /api/reference/delivery-points?city=… */
export interface DeliveryPointDto {
  id: number;
  address: string;
  phone: string | null;
  email: string | null;
  work_hours: string | null;
  info: string | null;
  pickup_from_truck: boolean;
}

export interface OrderItemDto {
  id: number;
  itemable_type: string;
  itemable_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrderDto {
  id: number;
  user_id: number | null;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_type: string;
  city_id: number;
  pickup_point_id: number | null;
  delivery_address: Record<string, string> | null;
  track_number: string | null;
  comment: string | null;
  subtotal: number;
  discount: number;
  delivery_cost: number;
  total: number;
  items: OrderItemDto[];
  created_at: string | null;
}

// ============================================================================
// Данные экранов
// ============================================================================

export interface DeliveryOption {
  value: string;
  label: string;
  requiresPickupPoint: boolean;
  requiresAddress: boolean;
}

export interface PaymentOption {
  value: string;
  label: string;
}

export interface CheckoutReference {
  delivery: DeliveryOption[];
  payment: PaymentOption[];
  /** Срок действия кода, минут — подсказка на шаге кода */
  codeTtlMin: number;
}

export interface DeliveryPoint {
  id: number;
  address: string;
  phone: string | null;
  email: string | null;
  workHours: string | null;
  info: string | null;
  pickupFromTruck: boolean;
}

/** Адрес курьера — структура, свободную строку бэк не принимает. */
export interface DeliveryAddress {
  city: string;
  street: string;
  house: string;
  apartment: string;
  comment: string;
}

/** Поля формы в том виде, как их заполняет пользователь. */
export interface CheckoutFormInput {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  deliveryType: string;
  pickupPointId: number | null;
  pickupPointAddress: string | null;
  deliveryAddress: DeliveryAddress | null;
  paymentMethod: string;
}

/**
 * Черновик заказа — один объект на весь поток, живёт в sessionStorage.
 * В URL не переносится: ФИО и телефон утекли бы в историю, реферер и логи.
 */
export interface CheckoutDraft {
  idempotencyKey: string;
  city: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryType: string;
  pickupPointId: number | null;
  pickupPointAddress: string | null;
  deliveryAddress: DeliveryAddress | null;
  paymentMethod: string;
  /** Момент выдачи кода (мс): от него считается кулдаун */
  codeIssuedAt: number | null;
  /** Длительность кулдауна из ответа бэка — параметр бэка, не константа фронта */
  codeRetryAfter: number | null;
}

export interface CheckoutAddressPayload {
  city: string;
  street: string;
  house: string;
  apartment?: string;
  comment?: string;
}

/** Тело POST /api/checkout: позиции не передаются — состав берётся из корзины. */
export interface CheckoutPayload {
  city: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_code: string;
  customer_email: string | null;
  delivery_type: string;
  pickup_point_id?: number;
  delivery_address?: CheckoutAddressPayload;
  payment_method: string;
  offer_accepted: true;
  privacy_accepted: true;
}

export interface OrderSnapshotItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/** Снимок заказа для страницы успеха: публичного чтения заказа гостя нет. */
export interface OrderSnapshot {
  id: string;
  createdAt: string;
  items: OrderSnapshotItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  customer: { name: string; phone: string; email: string };
  deliveryLabel: string;
  paymentLabel: string;
  pickupAddress: string | null;
  deliveryAddress: string | null;
}
