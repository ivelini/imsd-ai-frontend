"use client";
// Уведомления: матрица событие × канал; подписи событий — временный словарь фронта (ТЗ бэку)
import { useState } from "react";
import { mapAuthError, type AuthErrorResult } from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { Alert } from "@/shared/ui/Alert";
import { useNotificationSettings } from "@/features/account/api/useNotificationSettings";
import { useSaveNotificationSettings } from "@/features/account/api/useSaveNotificationSettings";
import {
  buildNotificationPayload,
  groupNotificationSettings,
} from "@/features/account/lib/notifications";
import type {
  NotificationChannel,
  NotificationEvent,
  NotificationSettingDto,
} from "@/features/account/types";

export function NotificationsForm() {
  const query = useNotificationSettings();

  return (
    <div className="account-card">
      <h3 className="account-card-title">Уведомления</h3>
      {query.isLoading ? <p className="auth_field_prompt">Загружаем…</p> : null}
      {query.isError ? (
        <p className="auth_field_prompt">Не удалось загрузить настройки.</p>
      ) : null}
      {query.data !== undefined ? <NotificationsEditor rows={query.data} /> : null}
    </div>
  );
}

function NotificationsEditor({ rows }: { rows: NotificationSettingDto[] }) {
  const save = useSaveNotificationSettings();
  const [groups, setGroups] = useState(() => groupNotificationSettings(rows));
  const [error, setError] = useState<AuthErrorResult | null>(null);
  const [saved, setSaved] = useState(false);

  const toggle = (event: NotificationEvent, channel: NotificationChannel) => {
    setGroups((current) =>
      current.map((group) =>
        group.event === event
          ? {
              ...group,
              channels: { ...group.channels, [channel]: !group.channels[channel] },
            }
          : group,
      ),
    );
    setSaved(false);
  };

  const submit = () => {
    setError(null);
    setSaved(false);
    save.mutate(buildNotificationPayload(groups), {
      onSuccess: (settings) => {
        setGroups(groupNotificationSettings(settings));
        setSaved(true);
      },
      onError: (cause) => setError(mapAuthError(toErrorResponse(cause))),
    });
  };

  return (
    <>
      <div className="account-notify">
        {groups.map((group) => (
          <div className="account-notify-row" key={group.event}>
            <span className="account-notify-name">{group.label}</span>
            <label className="account-notify-channel">
              <input
                type="checkbox"
                checked={group.channels.sms}
                onChange={() => toggle(group.event, "sms")}
              />{" "}
              SMS
            </label>
            <label className="account-notify-channel">
              <input
                type="checkbox"
                checked={group.channels.email}
                onChange={() => toggle(group.event, "email")}
              />{" "}
              E-mail
            </label>
          </div>
        ))}
      </div>

      {error !== null ? (
        <Alert title="Не удалось сохранить настройки" text={error.message} />
      ) : null}
      {saved ? <p className="account-saved">Сохранено</p> : null}

      <button
        className="booking-btn-primary booking-btn-primary--auto"
        type="button"
        onClick={submit}
        disabled={save.isPending}
      >
        {save.isPending ? "Сохраняем..." : "Сохранить настройки"}
      </button>
    </>
  );
}
