import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Модель диска" crumbs={[{ label: "Главная", href: "/" }, { label: "Каталог дисков", href: "/catalog/wheels" }, { label: "Модель" }]} />;
}
