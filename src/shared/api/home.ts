// Home: GET /api/service-page/main (мок) — attention_blocks, slider, news,
// description, seo. Структура 1-в-1 с ответом бэка.
import type { HomeData, AttentionBlock } from "@/features/home/types";
import { HOME_DATA } from "@/data/products";
import { delay } from "./base";

export type { HomeData, AttentionBlock };

export async function getHomeData(): Promise<HomeData> {
  return delay(50, HOME_DATA);
}

/** attention_blocks — нужны лейауту (плашки .benefits на всех страницах) */
export async function getAttentionBlocks(): Promise<AttentionBlock[]> {
  return delay(30, HOME_DATA.attention_blocks);
}
