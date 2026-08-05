// Типы главной страницы (05.08.2026)
// Структура ответа GET /api/service-page/main — поля как у бэка.

/** Плашки-бенефиты: .benefit (раньше red/gold/green, теперь color hex) */
export interface AttentionBlock {
  title: string;
  /** Путь (по конвенции service_pages: link — путь, link_name — название) */
  link: string;
  link_name: string;
  color: string;
}

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
  attention_blocks: AttentionBlock[];
  slider: {
    tires: SliderTire[];
    wheels: SliderProduct[];
  };
  news: HomeNews[];
  description: string;
  seo: HomeSeo;
}
