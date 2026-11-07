// Статьи: живой API (05.11.2026) — список блога, категории и пагинация в URL
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleCategories, getArticles } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { Pagination } from "@/shared/ui/Pagination";
import { ArticlesList } from "@/features/articles/components/ArticlesList";

const PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toPage(raw: string | string[] | undefined): number {
  const value = Number.parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ""), 10);

  return Number.isFinite(value) && value >= 1 ? value : 1;
}

function toCategory(raw: string | string[] | undefined): string | null {
  return typeof raw === "string" && raw !== "" ? raw : null;
}

function buildPageHref(category: string | null, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("page", String(page));

  return `/articles?${params.toString()}`;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = toCategory(params.category);
  const page = toPage(params.page);
  const [categories, result] = await Promise.all([
    getArticleCategories(),
    getArticles({ category, page, perPage: PER_PAGE }),
  ]);

  // 404 — категории нет или она неактивна
  if (result === null) notFound();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Статьи" }]}
      />
      <section className="news-section container">
        <h2>Статьи</h2>
        {categories.length > 0 && (
          <nav className="articles-categories">
            <Link
              href="/articles"
              className={`articles-category-link${category === null ? " articles-category-link_active" : ""}`}
            >
              Все
            </Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={`/articles?category=${encodeURIComponent(item.slug)}`}
                className={`articles-category-link${item.slug === category ? " articles-category-link_active" : ""}`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        )}
        <ArticlesList articles={result.items} />
        <Pagination
          current={result.meta.page}
          total={result.meta.lastPage}
          buildHref={(next) => buildPageHref(category, next)}
        />
      </section>
    </>
  );
}
