// SEO: статичный контент SEO-блоков каталога (из мока)
import { getSeoContentMock, SEO_CONTENT } from "@/data/catalog";
import type { SeoContent } from "@/features/catalog/types";
import { delay } from "./base";

export { SEO_CONTENT };

export async function getSeoContent(city?: string): Promise<SeoContent> {
  // city — контекст запроса; при подключении API уходит в query fetch-запроса
  return delay(30, getSeoContentMock(city));
}
