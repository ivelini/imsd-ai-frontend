"use client";
// Форма входа/регистрации: .auth_card (фаза 4)
// Сабмит — мок-сессия (loginMock/registerMock), после входа → /account.
// Без RHF/Zod до API (решение 05.08.2026).
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin, useRegister } from "@/features/auth/api/useAuthMutations";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [remember, setRemember] = useState(true);
  const [agreement, setAgreement] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending =
    loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = () => {
    if (isPending) return;
    const onSuccess = () => router.push("/account");
    if (mode === "login") {
      loginMutation.mutate({ login, password, remember }, { onSuccess });
    } else {
      if (password !== password2) return;
      registerMutation.mutate({ name, login, password }, { onSuccess });
    }
  };

  const rememberIcon = (checked: boolean) =>
    checked ? "/assets/img/order_check_a.svg" : "/assets/img/order_check.svg";

  return (
    <div className="auth_card">
      {mode === "register" && (
        <div className="auth_field">
          <label htmlFor="reg-name">Имя*</label>
          <input
            type="text"
            id="reg-name"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <div className="auth_field">
        <label htmlFor={mode === "login" ? "login-phone" : "reg-phone"}>
          Телефон или E-mail{mode === "register" && "*"}
        </label>
        <input
          type="text"
          id={mode === "login" ? "login-phone" : "reg-phone"}
          placeholder="Телефон или E-mail"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        {mode === "register" && (
          <div className="auth_field_prompt">
            *На него отправим данные заказа и код подтверждения
          </div>
        )}
      </div>

      <div className="auth_field">
        <div className="auth_field_label_row">
          <label htmlFor={mode === "login" ? "login-password" : "reg-password"}>
            Пароль{mode === "register" && "*"}
          </label>
          {mode === "login" && (
            <a
              href="#"
              className="auth_field_link"
              onClick={(e) => e.preventDefault()}
            >
              Забыли пароль?
            </a>
          )}
        </div>
        <input
          type="password"
          id={mode === "login" ? "login-password" : "reg-password"}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "register" && (
          <div className="auth_field_prompt">Минимум 6 символов</div>
        )}
      </div>

      {mode === "register" && (
        <div className="auth_field">
          <label htmlFor="reg-password2">Повторите пароль*</label>
          <input
            type="password"
            id="reg-password2"
            placeholder="Повторите пароль"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
      )}

      <button
        type="button"
        className="auth_remember"
        onClick={() =>
          mode === "login" ? setRemember(!remember) : setAgreement(!agreement)
        }
      >
        <img src={rememberIcon(mode === "login" ? remember : agreement)} alt="" />
        <span>
          {mode === "login"
            ? "Запомнить меня"
            : "Согласен с Политикой конфиденциальности и Публичной офертой"}
        </span>
      </button>

      <button
        type="submit"
        className="auth_submit"
        onClick={handleSubmit}
        disabled={isPending}
      >
        {mode === "login"
          ? isPending
            ? "Входим..."
            : "Войти"
          : isPending
            ? "Регистрируем..."
            : "Зарегистрироваться"}
      </button>

      <div className="auth_switch">
        {mode === "login" ? (
          <>
            Ещё нет аккаунта? <Link href="/auth/register">Зарегистрируйтесь</Link>
          </>
        ) : (
          <>
            Уже есть аккаунт? <Link href="/auth/login">Войти</Link>
          </>
        )}
      </div>
    </div>
  );
}
