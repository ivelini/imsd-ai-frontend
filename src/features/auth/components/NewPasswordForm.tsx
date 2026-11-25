"use client";
// Новый пароль: SMS — код + пароль ×2, ссылка из письма — пароль ×2 (email и token из URL)
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  isCodeError,
  mapAuthError,
  type AuthErrorResult,
} from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { formatPhone } from "@/shared/lib/phone";
import { passwordError } from "@/shared/lib/validation";
import { Alert } from "@/shared/ui/Alert";
import { CodeResend } from "@/shared/ui/CodeResend";
import { OtpCodeInput } from "@/shared/ui/OtpCodeInput";
import { useForgotPasswordSms } from "@/features/auth/api/useForgotPasswordSms";
import { useResetPasswordEmail } from "@/features/auth/api/useResetPasswordEmail";
import { useResetPasswordSms } from "@/features/auth/api/useResetPasswordSms";

const CODE_LENGTH = 4;

type NewPasswordFormProps =
  | { mode: "sms"; phone: string }
  | { mode: "email"; email: string; token: string };

export function NewPasswordForm(props: NewPasswordFormProps) {
  const { mode } = props;
  const phone = props.mode === "sms" ? props.phone : null;
  const email = props.mode === "email" ? props.email : null;
  const token = props.mode === "email" ? props.token : null;

  const requestCode = useForgotPasswordSms();
  const resetSms = useResetPasswordSms();
  const resetEmail = useResetPasswordEmail();

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [error, setError] = useState<AuthErrorResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const pending = resetSms.isPending || resetEmail.isPending;

  const applyError = (cause: unknown) => {
    const result = mapAuthError(toErrorResponse(cause));

    if (isCodeError(result.state)) setDigits(Array(CODE_LENGTH).fill(""));

    setError(result);
  };

  const resend = () => {
    if (phone === null) return;

    setError(null);
    requestCode.mutate(phone, {
      onSuccess: ({ retryAfter: seconds }) => {
        setIssuedAt(Date.now());
        setRetryAfter(seconds);
        setDigits(Array(CODE_LENGTH).fill(""));
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
    if (pending) return;

    setError(null);
    setLocalError(null);

    const passwordIssue = passwordError(password, password2);
    if (passwordIssue !== null) {
      setLocalError(passwordIssue);

      return;
    }

    if (mode === "sms") {
      if (phone === null || digits.some((digit) => digit === "")) return;

      resetSms.mutate(
        {
          phone,
          code: digits.join(""),
          password,
          confirmation: password2,
        },
        {
          onSuccess: (message) => setSuccessMessage(message),
          onError: applyError,
        },
      );

      return;
    }

    if (email === null || token === null) return;

    resetEmail.mutate(
      { email, token, password, confirmation: password2 },
      {
        onSuccess: (message) => setSuccessMessage(message),
        onError: applyError,
      },
    );
  };

  if (successMessage !== null) {
    return (
      <div className="auth_card">
        <p className="auth_field_prompt">{successMessage}</p>
        <Link href="/auth/login" className="auth_submit">
          Войти
        </Link>
      </div>
    );
  }

  const codeReady = digits.every((digit) => digit !== "");
  const alertText = error?.message ?? localError;

  return (
    <form className="auth_card" onSubmit={submit}>
      {mode === "sms" ? (
        <div className="auth_field">
          <label>Код из SMS</label>
          <OtpCodeInput
            digits={digits}
            onChange={setDigits}
            hasError={error !== null && isCodeError(error.state)}
          />
          <div className="auth_field_prompt">
            Код отправлен на номер {formatPhone(phone ?? "")}
          </div>
          <CodeResend
            issuedAt={issuedAt}
            retryAfter={retryAfter}
            pending={requestCode.isPending}
            onResend={resend}
          />
        </div>
      ) : null}

      <div className="auth_field">
        <label htmlFor="new-password">Новый пароль</label>
        <input
          type="password"
          id="new-password"
          placeholder="Новый пароль"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="auth_field_prompt">Минимум 8 символов</div>
      </div>

      <div className="auth_field">
        <label htmlFor="new-password2">Повторите пароль</label>
        <input
          type="password"
          id="new-password2"
          placeholder="Повторите пароль"
          autoComplete="new-password"
          value={password2}
          onChange={(event) => setPassword2(event.target.value)}
        />
      </div>

      {alertText !== null ? (
        <Alert title="Не удалось изменить пароль" text={alertText} />
      ) : null}

      {error?.state === "reset_token_invalid" ? (
        <div className="auth_field_prompt">
          <Link href="/auth/restore-password">Запросить новый код или ссылку</Link>
        </div>
      ) : null}

      <button
        type="submit"
        className="auth_submit"
        disabled={pending || (mode === "sms" && !codeReady)}
      >
        {pending ? "Сохраняем..." : "Сохранить пароль"}
      </button>

      <div className="auth_switch">
        Передумали? <Link href="/auth/login">Вернуться ко входу</Link>
      </div>
    </form>
  );
}
