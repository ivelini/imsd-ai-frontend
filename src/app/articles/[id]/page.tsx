// Статья блога: живой API (05.11.2026)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getRelatedArticles } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { ArticlePage } from "@/features/articles/components/ArticlePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return { title: "Статья не найдена" };

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.text || undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const related = await getRelatedArticles(article);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { label: "Главная", href: "/" },
          { label: "Статьи", href: "/articles" },
          { label: article.title },
        ]}
      />
      <ArticlePage article={article} related={related} />
    </>
  );
}
