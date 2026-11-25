// Регистрация: живой API, куда вернуть — из ?next= (внутренний путь проверяет safeNextPath)
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { safeNextPath } from "@/shared/lib/safeNext";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined);

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Регистрация" }]}
      />
      <section className="auth-section container">
        <h2>Регистрация</h2>
        <RegisterForm next={nextPath} />
      </section>
    </>
  );
}
