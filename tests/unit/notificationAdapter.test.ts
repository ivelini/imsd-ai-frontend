// Уведомления профиля: строки бэка → группы событий и обратно в полную матрицу PUT
import { describe, expect, it } from "vitest";

import {
  buildNotificationPayload,
  groupNotificationSettings,
  NOTIFICATION_EVENT_LABELS,
} from "@/features/account/lib/notifications";
import type { NotificationSettingDto } from "@/features/account/types";

const EVENTS = [
  "order_created",
  "payment_confirmed",
  "status_changed",
  "ready_for_pickup",
  "booking_created",
  "return_warranty",
] as const;

describe("notificationAdapter", () => {
  it("test_group_defaults_missing_true", () => {
    // отсутствующая строка — включена (умолчание бэка), группировка по событиям
    const rows: NotificationSettingDto[] = [
      { event: "order_created", channel: "sms", enabled: false },
    ];

    const groups = groupNotificationSettings(rows);

    expect(groups).toHaveLength(6);
    const created = groups.find((group) => group.event === "order_created");
    expect(created?.channels.sms).toBe(false);
    expect(created?.channels.email).toBe(true);
    const payment = groups.find((group) => group.event === "payment_confirmed");
    expect(payment?.channels.sms).toBe(true);
    expect(payment?.channels.email).toBe(true);
  });

  it("test_build_payload_full_matrix", () => {
    // тело PUT — полная матрица 6 × 2, выключенной остаётся ровно одна пара
    const groups = groupNotificationSettings([
      { event: "payment_confirmed", channel: "email", enabled: false },
    ]);

    const payload = buildNotificationPayload(groups);

    expect(payload).toHaveLength(12);
    expect(payload.filter((row) => row.enabled === false)).toEqual([
      { event: "payment_confirmed", channel: "email", enabled: false },
    ]);
    expect(new Set(payload.map((row) => `${row.event}:${row.channel}`)).size).toBe(12);
  });

  it("test_event_labels_complete", () => {
    // у каждого события из API есть русская подпись, лишних ключей нет
    expect(Object.keys(NOTIFICATION_EVENT_LABELS).sort()).toEqual([...EVENTS].sort());
    for (const label of Object.values(NOTIFICATION_EVENT_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
