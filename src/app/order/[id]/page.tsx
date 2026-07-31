import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Заказ" crumbs={[{ label: "Главная", href: "/" }, { label: "Заказ" }]} />;
}
