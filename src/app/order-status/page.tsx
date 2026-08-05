// Статус заказа (фаза 4)
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { OrderStatusPage } from "@/features/checkout/components/OrderStatusPage";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Статус заказа" }]}
      />
      <OrderStatusPage />
    </>
  );
}
