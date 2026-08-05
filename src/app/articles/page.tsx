// Статьи (фаза 4)
import { getArticles } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { ArticlesList } from "@/features/articles/components/ArticlesList";

export default async function Page() {
  const articles = await getArticles();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Статьи" }]}
      />
      <ArticlesList articles={articles} />
    </>
  );
}
