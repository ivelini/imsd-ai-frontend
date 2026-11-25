// Профиль клиента: живой API, сессия — Bearer-токен (24.11.2026)
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { ProfileView } from "@/features/account/components/ProfileView";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[
          { label: "Главная", href: "/" },
          { label: "Личный кабинет" },
          { label: "Профиль" },
        ]}
      />
      <ProfileView />
    </>
  );
}
