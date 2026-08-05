// Регистрация (фаза 4)
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Регистрация" }]}
      />
      <section className="auth-section container">
        <h2>Регистрация</h2>
        <AuthForm mode="register" />
      </section>
    </>
  );
}
