"use client";
// Телефон профиля: новый номер → код из SMS → подтверждение; номер = логин
import { useState, type FormEvent } from "react";
import {
  isCodeError,
  mapAuthError,
  type AuthErrorResult,
} from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { formatPhone } from "@/shared/lib/phone";
import { Alert } from "@/shared/ui/Alert";
import { CodeResend } from "@/shared/ui/CodeResend";
import { useChangePhone } from "@/features/account/api/useChangePhone";
import { useRequestPhoneCode } from "@/features/account/api/useRequestPhoneCode";

const CODE_LENGTH = 4;

interface ProfilePhoneFormProps {
  phone: string | null;
}

export function ProfilePhoneForm({ phone }: ProfilePhoneFormProps) {
  const request = useRequestPhoneCode();
  const change = useChangePhone();

  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<AuthErrorResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [issuedAt, setIssuedAt] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const changeNewPhone = (value: string) => {
    // код выдан на прежний номер — при смене просим новый
    if (issuedAt !== null) {
      setIssuedAt(null);
      setRetryAfter(null);
      setCode("");
    }

    setNewPhone(value);
    setSaved(false);
  };

  const requestCode = () => {
    const value = newPhone.trim();
    setError(null);
    setFieldError(null);
    setSaved(false);

    if (value === "") {
      setFieldError("Укажите новый номер");

      return;
    }

    request.mutate(value, {
      onSuccess: ({ retryAfter: seconds }) => {
        setIssuedAt(Date.now());
        setRetryAfter(seconds);
        setCode("");
      },
      onError: (cause) => {
        const result = mapAuthError(toErrorResponse(cause));

        if (result.state === "cooldown" && result.retryAfter !== undefined) {
          setIssuedAt(Date.now());
          setRetryAfter(result.retryAfter);
        }

        setError(result);
      },
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (change.isPending) return;

    setError(null);
    setFieldError(null);
    setSaved(false);

    if (code.length !== CODE_LENGTH) {
      setFieldError("Введите код из SMS");

      return;
    }

    change.mutate(
      { phone: newPhone.trim(), code },
      {
        onSuccess: () => {
          setSaved(true);
          setNewPhone("");
          setCode("");
          setIssuedAt(null);
          setRetryAfter(null);
        },
        onError: (cause) => {
          const result = mapAuthError(toErrorResponse(cause));

          if (isCodeError(result.state)) setCode("");

          setError(result);
        },
      },
    );
  };

  return (
    <div className="account-card">
      <h3 className="account-card-title">Телефон</h3>
      <p className="account-phone-current">
        {phone != null ? formatPhone(phone) : "—"}
        <span className="account-phone-note"> — по нему вы входите в личный кабинет</span>
      </p>

      <form onSubmit={submit}>
        <div className="account-fields-row">
          <div className="auth_field">
            <label htmlFor="account-new-phone">Новый номер</label>
            <input
              type="tel"
              id="account-new-phone"
              placeholder="+7 (___) ___-__-__"
              autoComplete="tel"
              value={newPhone}
              onChange={(event) => changeNewPhone(event.target.value)}
            />
          </div>

          <div className="auth_field">
            <label htmlFor="account-phone-code">Код из SMS</label>
            <input
              type="text"
              id="account-phone-code"
              placeholder="Код из SMS"
              inputMode="numeric"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
              }
            />
          </div>
        </div>

        {fieldError !== null ? (
          <div className="auth_field_prompt auth_field_prompt--error">{fieldError}</div>
        ) : null}

        <CodeResend
          issuedAt={issuedAt}
          retryAfter={retryAfter}
          pending={request.isPending}
          onResend={requestCode}
          label={issuedAt === null ? "Получить код" : "Отправить код повторно"}
        />

        {error !== null ? (
          <Alert title="Не удалось сменить номер" text={error.message} />
        ) : null}
        {saved ? <p className="account-saved">Номер изменён</p> : null}

        <button
          className="booking-btn-secondary"
          type="submit"
          disabled={change.isPending || code.length !== CODE_LENGTH}
        >
          {change.isPending ? "Подтверждаем..." : "Подтвердить новый номер"}
        </button>
      </form>
    </div>
  );
}
