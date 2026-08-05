// Сервисная страница: GET /api/service_page/<slug> (мок)
// Макета нет — разметка по образцу статьи (.article-title/.article-content)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServicePage } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServicePage(slug);
  return { title: page ? page.title : "Страница не найдена" };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getServicePage(slug);

  if (!page) notFound();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: page.title }]}
      />
      <section className="article-section container">
        <h1 className="article-title">{page.title}</h1>
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      </section>
    </>
  );
}
