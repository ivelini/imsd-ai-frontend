// origin-бейдж бэка → параметр карточки (общий для листинга и карточки товара)
import type { OriginItemDto } from "@/features/catalog/types";
import type { ProductParam } from "@/shared/types/product";

/** badge — текст бейджа, description — текст попапа (ParamBadge рендерит его как HTML). */
export function toOriginParam(
  name: string,
  item: OriginItemDto | null | undefined,
): ProductParam | null {
  if (!item) return null;
  return {
    name,
    value: item.badge,
    badge: true,
    description: item.description ? { title: item.badge, text: item.description } : undefined,
  };
}
