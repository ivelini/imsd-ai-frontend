// Вход: живой API, куда вернуть — из ?next= (внутренний путь проверяет safeNextPath)
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { safeNextPath } from "@/shared/lib/safeNext";
import { LoginForm } from "@/features/auth/components/LoginForm";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : undefined);

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Вход" }]}
      />
      <section className="auth-section container">
        <h2>Вход</h2>
        <LoginForm next={nextPath} />
      </section>
    </>
  );
}
