// Системная страница: системная статья из GET /api/articles/{slug} (05.11.2026)
// Макета нет — разметка по образцу статьи (.article-title/.article-content)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { ArticleBlock } from "@/shared/ui/ArticleBlock";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Страница не найдена" };

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.text || undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: article.title }]}
      />
      <section className="article-section container">
        <h1 className="article-title">{article.title}</h1>
        <ArticleBlock article={article} />
      </section>
    </>
  );
}
