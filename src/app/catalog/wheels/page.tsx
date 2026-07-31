import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Каталог дисков" crumbs={[{ label: "Главная", href: "/" }, { label: "Каталог дисков" }]} />;
}
