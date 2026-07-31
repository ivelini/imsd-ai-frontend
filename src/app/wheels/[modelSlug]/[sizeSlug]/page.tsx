import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Товар — диск" crumbs={[{ label: "Главная", href: "/" }, { label: "Каталог дисков", href: "/catalog/wheels" }, { label: "Модель" }, { label: "Типоразмер" }]} />;
}
