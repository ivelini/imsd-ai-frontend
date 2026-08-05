// Личный кабинет (фаза 4): минимум для мок-сессии — приветствие + выход.
// Разделы ЛК (orders/garage/favorites/addresses) — заглушки до API.
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { AccountPage } from "@/features/account/components/AccountPage";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]}
      />
      <AccountPage />
    </>
  );
}
