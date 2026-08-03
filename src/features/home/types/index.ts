// Типы товаров главной страницы (03.08.2026)

export interface SectionProduct {
  id: string;
  image: string;
  title: string;
  rating: string;
  price: string;
  oldPrice: string;
}

export interface NewsItem {
  id: string;
  title: string;
  text: string;
}
