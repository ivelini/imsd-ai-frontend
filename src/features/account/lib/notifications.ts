/**
 * Уведомления профиля: строки бэка → группы событий и обратно в матрицу PUT.
 *
 * Русские подписи событий — временный словарь фронта: API отдаёт только машинные
 * коды. Долг бэка, ТЗ — documentations/tz/notification-labels-backend.md; когда
 * бэк пришлёт подписи, меняется только этот файл.
 */
import type {
  NotificationChannel,
  NotificationEvent,
  NotificationGroup,
  NotificationSettingDto,
} from "@/features/account/types";

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  order_created: "Заказ создан",
  payment_confirmed: "Оплата подтверждена",
  status_changed: "Статус заказа изменился",
  ready_for_pickup: "Заказ готов к выдаче",
  booking_created: "Запись на шиномонтаж создана",
  return_warranty: "Возврат и гарантия",
};

/** Порядок строк карточки — как в макете профиля. */
export const NOTIFICATION_EVENT_ORDER: NotificationEvent[] = [
  "order_created",
  "payment_confirmed",
  "status_changed",
  "ready_for_pickup",
  "booking_created",
  "return_warranty",
];

export const NOTIFICATION_CHANNELS: NotificationChannel[] = ["sms", "email"];

function isEvent(value: string): value is NotificationEvent {
  return value in NOTIFICATION_EVENT_LABELS;
}

function isChannel(value: string): value is NotificationChannel {
  return value === "sms" || value === "email";
}

/** Матрица бэка → группы; отсутствующая строка — включена (умолчание API). */
export function groupNotificationSettings(
  rows: NotificationSettingDto[],
): NotificationGroup[] {
  const groups = NOTIFICATION_EVENT_ORDER.map(
    (event): NotificationGroup => ({
      event,
      label: NOTIFICATION_EVENT_LABELS[event],
      channels: { sms: true, email: true },
    }),
  );
  const byEvent = new Map(groups.map((group) => [group.event, group]));

  for (const row of rows) {
    if (!isEvent(row.event) || !isChannel(row.channel)) continue;

    const group = byEvent.get(row.event);
    if (group === undefined) continue;

    group.channels[row.channel] = row.enabled;
  }

  return groups;
}

/** Группы → полная матрица 6 × 2 для PUT (бэк принимает список переключателей). */
export function buildNotificationPayload(
  groups: NotificationGroup[],
): NotificationSettingDto[] {
  return groups.flatMap((group) =>
    NOTIFICATION_CHANNELS.map((channel) => ({
      event: group.event,
      channel,
      enabled: group.channels[channel],
    })),
  );
}
