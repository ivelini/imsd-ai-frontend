// Service pages: GET /api/service_page/<slug>
import { SERVICE_PAGE_CONTENT } from "@/data/servicePages";
import type { ServicePage } from "@/data/servicePages";
import { delay } from "./base";

export async function getServicePage(
  slug: string,
): Promise<ServicePage | null> {
  const page = SERVICE_PAGE_CONTENT[slug];
  return delay(30, page ? { slug, ...page } : null);
}
