// Значение-плашка: с описанием — ParamBadge с попапом, без — сухой p-badge
// (каталог: параметры и строка «Самовывоз»; страница товара: параметры)
import type { ParamDescription } from "@/shared/types/product";
import { ParamBadge } from "./ParamBadge";

export function BadgeValue({ label, description }: { label: string; description?: ParamDescription }) {
  if (description) return <ParamBadge label={label} description={description} />;
  return <span className="p-badge">{label} {">"}</span>;
}
