"use client";
// Вход/имя в шапке (фаза 4). Макета авторизованного состояния нет —
// по образцу: «Войти» → имя со ссылкой на ЛК.
import Link from "next/link";
import { useSession } from "@/features/auth/api/useSession";

export function LoginBadge() {
  const { data: session } = useSession();

  return (
    <Link
      href={session ? "/account" : "/auth/login"}
      className="login header-icon-and-btn"
      id="header-login"
    >
      <img src="/assets/img/login.svg" alt="" />
      <p className="header-icon-and-btn-text">{session ? session.name : "Войти"}</p>
    </Link>
  );
}
