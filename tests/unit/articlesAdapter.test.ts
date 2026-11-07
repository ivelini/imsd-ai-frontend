import { describe, expect, it } from "vitest";
import {
  buildArticlesQuery,
  toArticle,
  toArticleCategories,
  toArticleListItem,
} from "@/shared/api/articles";
import { toNavLinks } from "@/shared/api/nav";
import type {
  ArticleDto,
  ArticleListItemDto,
} from "@/features/articles/types";

const LIST_ITEM_DTO: ArticleListItemDto = {
  id: 1,
  title: "Как выбрать шины",
  slug: "kak-vybrat-siny",
  excerpt: "Анонс",
  image_url: null,
  published_at: "2026-07-31T10:00:00Z",
  category: { title: "Советы", slug: "sovety" },
};

const ARTICLE_DTO: ArticleDto = {
  id: 2,
  type: "blog",
  title: "Текст",
  slug: "tekst",
  excerpt: "Анонс",
  body: "<p>Текст</p>",
  image_url: null,
  meta_title: "Meta",
  meta_description: "Desc",
  published_at: "2026-07-31T10:00:00Z",
  category: { title: "Советы", slug: "sovety" },
};

describe("toArticleListItem", () => {
  it("test_article_list_item_maps_dto", () => {
    const item = toArticleListItem(LIST_ITEM_DTO);

    expect(item.text).toBe("Анонс");
    expect(item.image).toBe("/assets/img/news.png");
    expect(item.date).toBe("31 июля 2026");
    expect(item.category.slug).toBe("sovety");
  });

  it("test_article_list_item_handles_empty_fields", () => {
    const item = toArticleListItem({
      ...LIST_ITEM_DTO,
      excerpt: null,
      image_url: null,
      published_at: null,
    });

    expect(item.text).toBe("");
    expect(item.date).toBe("");
    expect(item.image).toBe("/assets/img/news.png");
  });

  it("test_article_date_uses_site_timezone", () => {
    const item = toArticleListItem({
      ...LIST_ITEM_DTO,
      published_at: "2026-07-31T20:00:00Z",
    });

    expect(item.date).toBe("1 августа 2026");
  });
});

describe("toArticle", () => {
  it("test_article_maps_dto", () => {
    const article = toArticle(ARTICLE_DTO);

    expect(article.contentHtml).toBe("<p>Текст</p>");
    expect(article.metaTitle).toBe("Meta");
    expect(article.metaDescription).toBe("Desc");
    expect(article.type).toBe("blog");

    const system = toArticle({ ...ARTICLE_DTO, type: "system", category: null });
    expect(system.category).toBeNull();
  });
});

describe("toArticleCategories", () => {
  it("test_article_categories_map_tree", () => {
    const categories = toArticleCategories([
      {
        title: "Советы",
        slug: "sovety",
        children: [
          { title: "Зимние", slug: "zimnie" },
          { title: "Летние", slug: "letnie" },
        ],
      },
    ]);

    expect(categories[0].children[0].slug).toBe("zimnie");
    expect(categories[0].children[1].slug).toBe("letnie");
  });
});

describe("toNavLinks", () => {
  it("test_nav_links_map_menu_and_fixed", () => {
    const { headerLinks, footerLinks } = toNavLinks({
      header: [{ title: "Доставка", slug: "dostavka" }],
      footer: [],
    });

    expect(headerLinks[0].link).toBe("/booking");
    expect(headerLinks[1]).toEqual({
      link: "/service-page/dostavka",
      link_name: "Доставка",
    });
    expect(headerLinks.at(-1)?.link).toBe("/articles");
    expect(footerLinks[0].link).toBe("/catalog/tires");
    expect(footerLinks.at(-1)?.link).toBe("/articles");
  });

  it("test_nav_links_fallback_without_menu", () => {
    const { headerLinks, footerLinks } = toNavLinks(null);

    expect(headerLinks.map((link) => link.link)).toEqual([
      "/booking",
      "/articles",
    ]);
    expect(footerLinks.map((link) => link.link)).toEqual([
      "/catalog/tires",
      "/articles",
    ]);
  });
});

describe("buildArticlesQuery", () => {
  it("test_articles_query_builds_params", () => {
    expect(buildArticlesQuery({ category: null, page: 2, perPage: 12 })).toBe(
      "page=2&per_page=12",
    );
    expect(
      buildArticlesQuery({ category: "sovety", page: 1, perPage: 12 }),
    ).toBe("category=sovety&page=1&per_page=12");
  });
});
