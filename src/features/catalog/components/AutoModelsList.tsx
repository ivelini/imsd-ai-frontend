// Список уровня каскада авто: заголовок + ссылки (марки/модели/годы/модификации).
// Разметка 1-в-1 с .auto-models из макета; серверный компонент.
import Link from "next/link";

export interface AutoModelsListItem {
  key: string | number;
  label: string;
  href: string;
}

interface AutoModelsListProps {
  title: string;
  items: AutoModelsListItem[];
}

export function AutoModelsList({ title, items }: AutoModelsListProps) {
  return (
    <div className="auto-models">
      <h2 className="auto-models-title">{title}</h2>
      <div className="auto-models-list">
        {items.map((item) => (
          <Link key={item.key} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
