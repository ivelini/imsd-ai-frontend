// Вход (фаза 4)
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Вход" }]}
      />
      <section className="auth-section container">
        <h2>Вход</h2>
        <AuthForm mode="login" />
      </section>
    </>
  );
}
