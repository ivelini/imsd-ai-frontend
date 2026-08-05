"use client";
// Личный кабинет (фаза 4): приветствие из мок-сессии + выход
import Link from "next/link";
import { useSession } from "@/features/auth/api/useSession";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export function AccountPage() {
  const { data: session, isLoading } = useSession();

  if (isLoading) return null;

  return (
    <section className="account-section container">
      <h2>Личный кабинет</h2>
      {session ? (
        <>
          <p className="account-greeting">
            Здравствуйте, <b>{session.name}</b>!
          </p>
          <div className="account-nav">
            <Link href="/account/orders">Мои заказы</Link>
            <Link href="/account/garage">Гараж</Link>
            <Link href="/account/favorites">Избранное</Link>
            <Link href="/account/profile">Профиль</Link>
            <Link href="/account/addresses">Адреса</Link>
          </div>
          <LogoutButton />
        </>
      ) : (
        <div className="cart-empty">
          <p className="cart-empty-text">
            Вы не авторизованы.{" "}
            <Link href="/auth/login">Войдите</Link> или{" "}
            <Link href="/auth/register">зарегистрируйтесь</Link>.
          </p>
          <Link className="primary-button cart-empty-button" href="/auth/login">
            Войти
          </Link>
        </div>
      )}
    </section>
  );
}
