// Новый пароль по ссылке из письма: адрес бэка — /reset-password?token=…&email=…
// Параметры нет — ссылка обрезана или устарела: предлагаем запросить новую.
import Link from "next/link";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { NewPasswordForm } from "@/features/auth/components/NewPasswordForm";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const { token, email } = await searchParams;
  const tokenValue = typeof token === "string" ? token.trim() : "";
  const emailValue = typeof email === "string" ? email.trim() : "";

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Новый пароль" }]}
      />
      <section className="auth-section container">
        <h2>Новый пароль</h2>
        {tokenValue === "" || emailValue === "" ? (
          <div className="auth_card">
            <p className="auth_field_prompt">
              Ссылка восстановления недействительна или устарела.
            </p>
            <Link href="/auth/restore-password" className="auth_submit">
              Запросить новую ссылку
            </Link>
          </div>
        ) : (
          <NewPasswordForm mode="email" email={emailValue} token={tokenValue} />
        )}
      </section>
    </>
  );
}
