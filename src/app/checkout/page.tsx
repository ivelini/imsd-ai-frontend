import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Оформление заказа" crumbs={[{ label: "Главная", href: "/" }, { label: "Корзина", href: "/cart" }, { label: "Оформление заказа" }]} />;
}
