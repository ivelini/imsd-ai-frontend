// SEO: статичный контент SEO-блоков каталога (из мока)
import { SEO_CONTENT } from "@/data/catalog";
import type { SeoContent } from "@/features/catalog/types";
import { delay } from "./base";

export { SEO_CONTENT };

export async function getSeoContent(): Promise<SeoContent> {
  return delay(30, SEO_CONTENT);
}
