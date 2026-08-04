// Общие типы для параметров товара (фаза 3, 04.08.2026)
// Используются в каталоге и на странице товара

export interface ParamDescription {
  title: string;
  text: string;
}

/** Одна строка parameters-list — формирует «бэк» */
export interface ProductParam {
  name: string; // "Код товара:", "Производитель:"...
  value: string; // "АА-00075632", "Viatti"...
  /** true → рендерить как <span class="p-badge"> с возможным попапом */
  badge?: boolean;
  /** Если badge=true и есть description — рендерить ParamBadge с попапом */
  description?: ParamDescription;
}
