import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Товар — шина" crumbs={[{ label: "Главная", href: "/" }, { label: "Каталог шин", href: "/catalog/tires" }, { label: "Модель" }, { label: "Типоразмер" }]} />;
}
