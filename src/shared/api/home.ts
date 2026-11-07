// Home: GET /api/service-page/main (мок) — badges, slider, news,
// description, seo. Структура 1-в-1 с ответом бэка.
import type { HomeData } from "@/features/home/types";
import { HOME_DATA } from "@/data/products";
import { delay } from "./base";

export type { HomeData };

export async function getHomeData(): Promise<HomeData> {
  return delay(50, HOME_DATA);
}
