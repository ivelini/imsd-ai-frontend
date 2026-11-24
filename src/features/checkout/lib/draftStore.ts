/**
 * Черновик заказа и снимок созданного заказа — в sessionStorage.
 *
 * sessionStorage, а не localStorage: закрыл вкладку — ФИО и телефон ушли.
 * Снимок — единственный источник страницы успеха: у гостя публичного чтения заказа нет.
 */
import { createStorageStore } from "@/shared/lib/storageStore";
import type { CheckoutDraft, OrderSnapshot } from "@/features/checkout/types";

const DRAFT_KEY = "checkout-draft";
const SNAPSHOT_KEY = "checkout-order-snapshot";

export const draftStore = createStorageStore<CheckoutDraft>(DRAFT_KEY);
export const snapshotStore = createStorageStore<OrderSnapshot>(SNAPSHOT_KEY);
