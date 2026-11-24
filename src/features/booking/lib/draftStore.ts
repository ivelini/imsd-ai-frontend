/**
 * Черновик записи и снимок созданной записи — в sessionStorage.
 *
 * Черновик не в URL: имя и телефон утекли бы в историю браузера, реферер и логи.
 * sessionStorage, а не localStorage: закрыл вкладку — данные ушли.
 */
import type { BookingDto } from "@/shared/api/booking";
import type { BookingDraft } from "@/features/booking/types";
import { createStorageStore } from "@/shared/lib/storageStore";

const DRAFT_KEY = "booking-draft";
const SNAPSHOT_KEY = "booking-snapshot";

export const draftStore = createStorageStore<BookingDraft>(DRAFT_KEY);
export const snapshotStore = createStorageStore<BookingDto>(SNAPSHOT_KEY);
