"use client";
// Регистрация: форма → код из SMS на той же странице (пароль не покидает форму) → аккаунт
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  isCodeError,
  mapAuthError,
  type AuthErrorResult,
} from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { formatPhone } from "@/shared/lib/phone";
import { validateRegister, type FieldErrors } from "@/shared/lib/validation";
import { Alert } from "@/shared/ui/Alert";
import { CodeResend } from "@/shared/ui/CodeResend";
import { OtpCodeInput } from "@/shared/ui/OtpCodeInput";
import { useIssueRegisterCode } from "@/features/auth/api/useIssueRegisterCode";
import { useRegister } from "@/features/auth/api/useRegister";

const CODE_LENGTH = 4;

interface RegisterFormProps {
  /** Куда вернуть после регистрации: уже проверенный внутренний путь */
  next: string;
}

export function RegisterForm({ next }: RegisterFormProps) {
  const router = useRouter();
  const issueCode = useIssueRegisterCode();
  const register = useRegister();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<AuthErrorResult | null>(null);
  const [issuedAt, setIssuedAt] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const codeSent = issuedAt !== null;
  const pending = issueCode.isPending || register.isPending;

  const clearCode = () => {
    setIssuedAt(null);
    setRetryAfter(null);
    setDigits(Array(CODE_LENGTH).fill(""));
  };

  const changePhone = (value: string) => {
    // код выдан на прежний номер — при смене просим новый
    if (codeSent) clearCode();

    setPhone(value);
  };

  const sendCode = () => {
    issueCode.mutate(phone, {
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

    const errors = validateRegister({
      name,
      phone,
      email,
      password,
      confirmation: password2,
      agreement,
    });

    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length > 0) return;

    if (!codeSent) {
      sendCode();

      return;
    }

    register.mutate(
      {
        phone,
        name: name.trim(),
        email: email.trim() === "" ? null : email.trim(),
        password,
        confirmation: password2,
        code: digits.join(""),
      },
      {
        onSuccess: () => router.replace(next),
        onError: (cause) => {
          const result = mapAuthError(toErrorResponse(cause));

          if (isCodeError(result.state)) setDigits(Array(CODE_LENGTH).fill(""));

          setError(result);
        },
      },
    );
  };

  const codeReady = digits.every((digit) => digit !== "");
  const loginHref = `/auth/login?next=${encodeURIComponent(next)}`;

  return (
    <form className="auth_card" onSubmit={submit}>
      <div className="auth_field">
        <label htmlFor="reg-name">Имя*</label>
        <input
          type="text"
          id="reg-name"
          placeholder="Имя"
          autoComplete="given-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {fieldErrors.name !== undefined ? (
          <div className="auth_field_prompt auth_field_prompt--error">{fieldErrors.name}</div>
        ) : null}
      </div>

      <div className="auth_field">
        <label htmlFor="reg-phone">Телефон*</label>
        <input
          type="tel"
          id="reg-phone"
          placeholder="Телефон"
          autoComplete="tel"
          value={phone}
          onChange={(event) => changePhone(event.target.value)}
        />
        <div className="auth_field_prompt">На него отправим код подтверждения</div>
        {fieldErrors.phone !== undefined ? (
          <div className="auth_field_prompt auth_field_prompt--error">{fieldErrors.phone}</div>
        ) : null}
      </div>

      <div className="auth_field">
        <label htmlFor="reg-email">E-mail</label>
        <input
          type="email"
          id="reg-email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {fieldErrors.email !== undefined ? (
          <div className="auth_field_prompt auth_field_prompt--error">{fieldErrors.email}</div>
        ) : null}
      </div>

      <div className="auth_field">
        <label htmlFor="reg-password">Пароль*</label>
        <input
          type="password"
          id="reg-password"
          placeholder="Пароль"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="auth_field_prompt">Минимум 8 символов</div>
        {fieldErrors.password !== undefined ? (
          <div className="auth_field_prompt auth_field_prompt--error">{fieldErrors.password}</div>
        ) : null}
      </div>

      <div className="auth_field">
        <label htmlFor="reg-password2">Повторите пароль*</label>
        <input
          type="password"
          id="reg-password2"
          placeholder="Повторите пароль"
          autoComplete="new-password"
          value={password2}
          onChange={(event) => setPassword2(event.target.value)}
        />
      </div>

      <button
        type="button"
        className="auth_remember"
        onClick={() => setAgreement(!agreement)}
      >
        <img
          src={agreement ? "/assets/img/order_check_a.svg" : "/assets/img/order_check.svg"}
          alt=""
        />
        <span>Согласен с Политикой конфиденциальности и Публичной офертой</span>
      </button>
      {fieldErrors.agreement !== undefined ? (
        <div className="auth_field_prompt auth_field_prompt--error">{fieldErrors.agreement}</div>
      ) : null}

      {codeSent ? (
        <div className="auth_field">
          <label>Код из SMS</label>
          <OtpCodeInput
            digits={digits}
            onChange={setDigits}
            hasError={error !== null && isCodeError(error.state)}
          />
          <div className="auth_field_prompt">
            Код отправлен на номер {formatPhone(phone)}
          </div>
          <CodeResend
            issuedAt={issuedAt}
            retryAfter={retryAfter}
            pending={issueCode.isPending}
            onResend={sendCode}
          />
        </div>
      ) : null}

      {error !== null ? (
        <Alert title="Не удалось зарегистрироваться" text={error.message} />
      ) : null}

      {error?.state === "phone_taken" ? (
        <div className="auth_field_prompt">
          Уже есть аккаунт? <Link href={loginHref}>Войдите</Link>
        </div>
      ) : null}

      <button
        type="submit"
        className="auth_submit"
        disabled={pending || (codeSent && !codeReady)}
      >
        {register.isPending
          ? "Регистрируем..."
          : issueCode.isPending
            ? "Отправляем код..."
            : codeSent
              ? "Завершить регистрацию"
              : "Зарегистрироваться"}
      </button>

      <div className="auth_switch">
        Уже есть аккаунт? <Link href={loginHref}>Войти</Link>
      </div>
    </form>
  );
}
