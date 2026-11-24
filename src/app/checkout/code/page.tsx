// Шаг кода оформления (24.11.2026): справочник нужен для срока действия кода
import { getCheckoutReference } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { CheckoutCodeStep } from "@/features/checkout/components/CheckoutCodeStep";

export default async function Page() {
  const reference = await getCheckoutReference();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { label: "Главная", href: "/" },
          { label: "Корзина", href: "/cart" },
          { label: "Оформление заказа", href: "/checkout" },
          { label: "Подтверждение" },
        ]}
      />
      <CheckoutCodeStep reference={reference} />
    </>
  );
}
