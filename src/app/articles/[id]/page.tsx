// Статья (фаза 4)
import { notFound } from "next/navigation";
import { getArticle, getRelatedArticles } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { ArticlePage } from "@/features/articles/components/ArticlePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [article, related] = await Promise.all([
    getArticle(id),
    getRelatedArticles(id),
  ]);

  if (!article) notFound();

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
