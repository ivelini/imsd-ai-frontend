/**
 * Черновик заказа: сборка из формы, готовность шага кода, отметка выдачи кода.
 * Хранилище черновика — отдельно (draftStore): здесь только чистые переходы.
 */
import type { CheckoutDraft, CheckoutFormInput } from "@/features/checkout/types";

type CustomerNameInput = Pick<CheckoutFormInput, "lastName" | "firstName" | "middleName">;

/** ФИО одной строкой: бэк принимает одно поле `customer_name`. */
export function joinCustomerName(input: CustomerNameInput): string {
  return [input.lastName, input.firstName, input.middleName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function createCheckoutDraft(
  input: CheckoutFormInput,
  idempotencyKey: string,
  city: string,
): CheckoutDraft {
  return {
    idempotencyKey,
    city,
    customerName: joinCustomerName(input),
    phone: input.phone.trim(),
    email: input.email.trim(),
    deliveryType: input.deliveryType,
    pickupPointId: input.pickupPointId,
    pickupPointAddress: input.pickupPointAddress,
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod,
    codeIssuedAt: null,
    codeRetryAfter: null,
  };
}

/** Шаг кода без черновика (прямой заход по адресу) уводит на форму. */
export function isDraftReady(draft: CheckoutDraft | null): draft is CheckoutDraft {
  return draft !== null && draft.phone !== "" && draft.idempotencyKey !== "";
}

export function setCodeIssued(
  draft: CheckoutDraft,
  retryAfter: number,
  now: number,
): CheckoutDraft {
  return { ...draft, codeIssuedAt: now, codeRetryAfter: retryAfter };
}
