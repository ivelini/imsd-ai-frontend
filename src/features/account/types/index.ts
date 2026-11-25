// Типы личного кабинета: профиль, телефон, уведомления (Scramble, 24.11.2026)

export interface ProfileInput {
  name: string;
  surname: string | null;
  patronymic: string | null;
  email: string | null;
}

export interface ChangePhoneInput {
  phone: string;
  code: string;
}

export type NotificationEvent =
  | "order_created"
  | "payment_confirmed"
  | "status_changed"
  | "ready_for_pickup"
  | "booking_created"
  | "return_warranty";

export type NotificationChannel = "sms" | "email";

/** Строка ответа `GET /account/notification-settings` */
export interface NotificationSettingDto {
  event: string;
  channel: string;
  enabled: boolean;
}

/** Группа карточки «Уведомления»: событие и два переключателя каналов */
export interface NotificationGroup {
  event: NotificationEvent;
  label: string;
  channels: Record<NotificationChannel, boolean>;
}
