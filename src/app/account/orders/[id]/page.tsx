import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Детали заказа" crumbs={[{ label: "Главная", href: "/" }, { label: "Личный кабинет", href: "/account/profile" }, { label: "Мои заказы", href: "/account/orders" }, { label: "Заказ" }]} />;
}
