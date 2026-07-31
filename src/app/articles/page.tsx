import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Статьи" crumbs={[{ label: "Главная", href: "/" }, { label: "Статьи" }]} />;
}
