"use client";
// Восстановление: телефон → SMS-код на следующем шаге, e-mail → ссылка письмом
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mapAuthError, type AuthErrorResult } from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { Alert } from "@/shared/ui/Alert";
import { useForgotPasswordEmail } from "@/features/auth/api/useForgotPasswordEmail";
import { useForgotPasswordSms } from "@/features/auth/api/useForgotPasswordSms";
import { restoreTarget } from "@/features/auth/lib/restoreTarget";

export function RestorePasswordForm() {
  const router = useRouter();
  const sms = useForgotPasswordSms();
  const email = useForgotPasswordEmail();

  const [target, setTarget] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [error, setError] = useState<AuthErrorResult | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  const pending = sms.isPending || email.isPending;
  const alertText = error?.message ?? localError;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setLocalError(null);
    setEmailMessage(null);

    const value = target.trim();
    if (value === "") {
      setLocalError("Укажите телефон или e-mail");

      return;
    }

    if (restoreTarget(value) === "email") {
      email.mutate(value, {
        onSuccess: (message) => setEmailMessage(message),
        onError: (cause) => setError(mapAuthError(toErrorResponse(cause))),
      });

      return;
    }

    sms.mutate(value, {
      onSuccess: () => router.push(`/auth/new-password?phone=${encodeURIComponent(value)}`),
      onError: (cause) => setError(mapAuthError(toErrorResponse(cause))),
    });
  };

  return (
    <form className="auth_card" onSubmit={submit}>
      <div className="auth_field">
        <label htmlFor="restore-login">Телефон или E-mail</label>
        <input
          type="text"
          id="restore-login"
          placeholder="Телефон или E-mail"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        />
        <div className="auth_field_prompt">
          На телефон придёт код из SMS, на e-mail — ссылка для сброса пароля
        </div>
      </div>

      {alertText !== null ? (
        <Alert title="Не удалось восстановить пароль" text={alertText} />
      ) : null}

      {emailMessage !== null ? (
        <p className="auth_field_prompt">{emailMessage}</p>
      ) : null}

      <button type="submit" className="auth_submit" disabled={pending}>
        {pending ? "Отправляем..." : "Восстановить пароль"}
      </button>

      <div className="auth_switch">
        Вспомнили пароль? <Link href="/auth/login">Войдите</Link>
      </div>
    </form>
  );
}
