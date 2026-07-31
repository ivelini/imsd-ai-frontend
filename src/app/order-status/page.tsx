import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Статус заказа" crumbs={[{ label: "Главная", href: "/" }, { label: "Статус заказа" }]} />;
}
