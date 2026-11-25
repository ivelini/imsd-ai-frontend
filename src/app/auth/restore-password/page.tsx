// Восстановление пароля: телефон → SMS-код, e-mail → ссылка письмом
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { RestorePasswordForm } from "@/features/auth/components/RestorePasswordForm";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Восстановление пароля" }]}
      />
      <section className="auth-section container">
        <h2>Восстановление пароля</h2>
        <RestorePasswordForm />
      </section>
    </>
  );
}
