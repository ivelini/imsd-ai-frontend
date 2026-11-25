"use client";
// Вход: телефон и пароль (API принимает только телефон), «Запомнить меня» — выбор хранилища
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mapAuthError, type AuthErrorResult } from "@/shared/api/authErrors";
import { toErrorResponse } from "@/shared/api/http";
import { Alert } from "@/shared/ui/Alert";
import { useLogin } from "@/features/auth/api/useLogin";

interface LoginFormProps {
  /** Куда вернуть после входа: уже проверенный внутренний путь */
  next: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const login = useLogin();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<AuthErrorResult | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (login.isPending) return;

    setError(null);
    login.mutate(
      { phone, password, remember },
      {
        onSuccess: () => router.replace(next),
        onError: (cause) => setError(mapAuthError(toErrorResponse(cause))),
      },
    );
  };

  return (
    <form className="auth_card" onSubmit={submit}>
      <div className="auth_field">
        <label htmlFor="login-phone">Телефон</label>
        <input
          type="tel"
          id="login-phone"
          placeholder="Телефон"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      <div className="auth_field">
        <div className="auth_field_label_row">
          <label htmlFor="login-password">Пароль</label>
          <Link href="/auth/restore-password" className="auth_field_link">
            Забыли пароль?
          </Link>
        </div>
        <input
          type="password"
          id="login-password"
          placeholder="Пароль"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button
        type="button"
        className="auth_remember"
        onClick={() => setRemember(!remember)}
      >
        <img
          src={remember ? "/assets/img/order_check_a.svg" : "/assets/img/order_check.svg"}
          alt=""
        />
        <span>Запомнить меня</span>
      </button>

      {error !== null ? <Alert title="Не удалось войти" text={error.message} /> : null}

      <button type="submit" className="auth_submit" disabled={login.isPending}>
        {login.isPending ? "Входим..." : "Войти"}
      </button>

      <div className="auth_switch">
        Ещё нет аккаунта?{" "}
        <Link href={`/auth/register?next=${encodeURIComponent(next)}`}>
          Зарегистрируйтесь
        </Link>
      </div>
    </form>
  );
}
