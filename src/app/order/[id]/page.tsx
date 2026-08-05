// Заказ (фаза 4): страница клиентская — заказ в localStorage-моке, читается
// через useOrder (getOrder выполняет localStorage, недоступный в RSC-процессе).
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { OrderPage } from "@/features/checkout/components/OrderPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { label: "Главная", href: "/" },
          { label: "Корзина", href: "/cart" },
          { label: "Заказ" },
        ]}
      />
      <OrderPage id={id} />
    </>
  );
}
