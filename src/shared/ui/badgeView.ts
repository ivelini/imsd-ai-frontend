// Представление плашки-бейджа для рендера: чистая функция (тестируется без DOM)
// Разметка — плашка шаблона: `benefit benefit--{color}` + иконка + текст.
import { BADGE_COLORS, type Badge, type BadgeIconKey } from "@/shared/types/badge";

export interface BadgeView {
  /** Классы плашки: `benefit benefit--red`. */
  className: string;
  /** Иконка плашки; null — иконку взять не из чего (неизвестный ключ и цвет). */
  iconKey: BadgeIconKey | null;
  /** Текст плашки — готовая строка бэка. */
  text: string;
  /** Адрес ссылки; null — плашка без ссылки. */
  href: string | null;
  /** Ссылка внешняя (http/https) — открывать в новой вкладке. */
  external: boolean;
}

function isIconKey(value: string): value is BadgeIconKey {
  return (BADGE_COLORS as readonly string[]).includes(value);
}

/** Иконка плашки: заданный `icon_key` → иначе по цвету-пресету. */
function resolveIconKey(iconKey: string | null, color: string): BadgeIconKey | null {
  if (iconKey && isIconKey(iconKey)) return iconKey;
  return isIconKey(color) ? color : null;
}

/** Бейдж → представление плашки. Ссылка, цвет и иконка — из данных бэка. */
export function toBadgeView(badge: Badge): BadgeView {
  const href = badge.link;

  return {
    className: `benefit benefit--${badge.color}`,
    iconKey: resolveIconKey(badge.icon_key, badge.color),
    text: badge.text,
    href,
    external: href !== null && /^https?:\/\//i.test(href),
  };
}

/** Стек бейджей → представления плашек; пустой стек — пустой список. */
export function toBadgeViews(badges: Badge[]): BadgeView[] {
  return badges.map(toBadgeView);
}
