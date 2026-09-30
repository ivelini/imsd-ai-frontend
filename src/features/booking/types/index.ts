/**
 * Типы домена записи на шиномонтаж. Поля — по контракту бэка
 * (`GET /booking/catalog`, `POST /booking/confirm`), не выдуманы.
 */

/** Услуга каталога записи. Цены — в копейках; `unit_price` приходит только с парой радиус+тип. */
export interface BookingServiceDto {
  id: number;
  name: string;
  base_price: number;
  has_rules?: boolean;
  unit_price?: number | null;
}

/** Выбранная услуга черновика: количество правится пользователем в границах бэка. */
export interface BookingDraftService {
  id: number;
  quantity: number;
}

/**
 * Черновик записи — один объект на весь поток, живёт в sessionStorage.
 * В URL не переносится: имя и телефон утекли бы в историю, реферер и логи.
 */
export interface BookingDraft {
  date: string | null; // 'YYYY-MM-DD'
  hour: number | null;
  radius: number | null; // value из rules.radius
  carType: string | null; // value из rules.car_type
  services: BookingDraftService[];
  name: string;
  phone: string;
  plate: string | null;
  /** Момент выдачи кода (мс): от него считается кулдаун; сбрасывается при смене времени. */
  codeIssuedAt: number | null;
  /** Длительность кулдауна из ответа бэка (`retry_after`) — параметр бэка, не константа фронта. */
  codeRetryAfter: number | null;
}
