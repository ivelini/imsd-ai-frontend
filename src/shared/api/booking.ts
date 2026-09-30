// Запись на шиномонтаж: слоты, каталог услуг, выдача кода, подтверждение, справочник.
// Контракт сверен с кодом бэка 30.09.2026 (ТЗ booking-client-api-preparation выполнено),
// источник истины — ../backend/documentations/scramble/public-api.json.
import { apiBase } from "./base";
import type { BookingServiceDto } from "@/features/booking/types";
import type { ConfirmPayload } from "@/features/booking/lib/payload";

/** Услуга-комплекс: набор услуг, отмечается одним кликом. */
export interface BookingComplexDto {
  id: number;
  name: string;
  service_ids: number[];
}

/** Значение селектора параметров записи: `value` уходит в запрос, `label` — на экран. */
export interface BookingRuleOptionDto {
  value: number | string;
  label: string;
}

export interface BookingCatalogDto {
  services: BookingServiceDto[];
  complexes: BookingComplexDto[];
  rules: { radius: BookingRuleOptionDto[]; car_type: BookingRuleOptionDto[] };
}

/** Час дня: `is_closed` — чип «занято». */
export interface BookingDaySlotDto {
  hour: number;
  is_closed: boolean;
}

/** Справочник параметров записи: то, что экран показывает, но не может зашивать у себя. */
export interface BookingReferenceDto {
  shop_address: string;
  shop_phone: string;
  code_ttl_min: number;
  min_lead_time_h: number;
  horizon_days: number;
  default_quantity: number;
}

export interface BookingItemDto {
  id: number;
  service?: { id: number; name: string };
  /** Копейки — снимок цены на момент записи */
  price: number;
  quantity: number;
}

/** Созданная запись (ответ подтверждения). Цены — копейки. */
export interface BookingDto {
  id: number;
  /** Номер для клиента: «TS-» + id с ведущими нулями */
  number: string;
  date: string;
  start_time: string;
  status: string;
  radius: number;
  car_type: string;
  plate: string | null;
  total_price: number;
  user?: { id: number; name: string; phone: string };
  items?: BookingItemDto[];
}

/**
 * Ошибка бэка с телом ответа. Несёт статус и `code` доменного отказа —
 * состояние экрана выбирает `mapBookingError`, а не текст сообщения.
 */
export class BookingApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`booking API: HTTP ${status}`);
    this.name = "BookingApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, init);
  const body = await readJson(res);

  if (!res.ok) {
    throw new BookingApiError(res.status, body);
  }

  return (body as { data: T }).data;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    // 500 от прокси приходит HTML — тело не должно ронять разбор
    return null;
  }
}

function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Карта доступности дней месяца: «Y-m-d» → есть ли открытый слот. */
export async function getBookingDays(
  dateFrom: string,
  dateTo: string,
): Promise<Record<string, boolean>> {
  const query = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  const data = await request<{ days: Record<string, boolean> }>(`/booking/slots?${query}`);

  return data.days;
}

export function getBookingDaySlots(date: string): Promise<BookingDaySlotDto[]> {
  return request<{ slots: BookingDaySlotDto[] }>(`/booking/slots/${date}`).then((d) => d.slots);
}

/** Каталог услуг. С парой радиус+тип отдаёт `unit_price`; без пары — только `base_price`. */
export function getBookingCatalog(
  radius: number | null,
  carType: string | null,
): Promise<BookingCatalogDto> {
  const query = new URLSearchParams();
  if (radius !== null) query.set("radius", String(radius));
  if (carType !== null) query.set("car_type", carType);
  const suffix = query.toString() ? `?${query}` : "";

  return request<BookingCatalogDto>(`/booking/catalog${suffix}`);
}

/** Выдача SMS-кода. `retry_after` — длительность кулдауна, не остаток. */
export function issueBookingCode(phone: string): Promise<{ retry_after: number }> {
  return post<{ retry_after: number }>("/booking/code", { phone });
}

/** Подтверждение записи: 201 — создана, 200 — повторная отправка того же кода. */
export function confirmBooking(payload: ConfirmPayload): Promise<BookingDto> {
  return post<BookingDto>("/booking/confirm", payload);
}

export function getBookingReference(): Promise<BookingReferenceDto> {
  return request<BookingReferenceDto>("/reference/booking");
}
