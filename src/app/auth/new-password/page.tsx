// Новый пароль по SMS: телефон пришёл из шага восстановления; без него — назад
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const { phone } = await searchParams;
  const phoneValue = typeof phone === "string" ? phone.trim() : "";

  if (phoneValue === "") redirect("/auth/restore-password");

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Новый пароль" }]}
      />
      <section className="auth-section container">
        <h2>Новый пароль</h2>
        <NewPasswordForm mode="sms" phone={phoneValue} />
      </section>
    </>
  );
}
