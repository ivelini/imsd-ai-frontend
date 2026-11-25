"use client";
// Профиль: сессия без токена уводит на вход; карточки — данные, телефон, уведомления
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/api/useSession";
import { AccountMenu } from "./AccountMenu";
import { NotificationsForm } from "./NotificationsForm";
import { ProfileDataForm } from "./ProfileDataForm";
import { ProfilePhoneForm } from "./ProfilePhoneForm";

export function ProfileView() {
  const router = useRouter();
  const { data: session, isLoading, isError, refetch } = useSession();

  useEffect(() => {
    if (isLoading || isError) return;
    if (session === null) router.replace("/auth/login?next=/account/profile");
  }, [isLoading, isError, session, router]);

  if (isLoading) return null;

  if (isError) {
    return (
      <section className="account-section container">
        <h2>Профиль</h2>
        <p className="account-greeting">Не удалось загрузить профиль.</p>
        <button type="button" className="primary-button" onClick={() => refetch()}>
          Повторить
        </button>
      </section>
    );
  }

  if (session == null) return null;

  return (
    <section className="account-section container">
      <h2>Профиль</h2>
      <div className="account-layout">
        <AccountMenu active="profile" />
        <div className="account-content">
          <ProfileDataForm client={session} />
          <ProfilePhoneForm phone={session.phone} />
          <NotificationsForm />
        </div>
      </div>
    </section>
  );
}
