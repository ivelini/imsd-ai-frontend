// Типы главной страницы (05.08.2026)
// Структура ответа GET /api/service-page/main — поля как у бэка.
import type { Badge } from "@/shared/types/badge";

/** Товар слайдера главной (шины/диски) */
export interface SliderProduct {
  image: string;
  title: string;
  link: string;
  price: number;
  old_price: number;
}

/** Товар-шина: дополнительно сезонность */
export interface SliderTire extends SliderProduct {
  season: "summer" | "winter" | "all-season";
}

/** Новость главной */
export interface HomeNews {
  image: string;
  title: string;
  link: string;
  description: string;
}

export interface HomeSeo {
  title: string;
  description: string;
}

export interface HomeData {
  /**
   * Стек бейджей страницы (общий контракт `badges`): если пришёл — страница
   * выводит плашки `.benefits`. Раньше здесь был `attention_blocks` с цветом-hex.
   */
  badges: Badge[];
  slider: {
    tires: SliderTire[];
    wheels: SliderProduct[];
  };
  news: HomeNews[];
  description: string;
  seo: HomeSeo;
}
