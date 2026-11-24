// Оформление заказа (24.11.2026): справочник способов — с живого API, на сервере
import { getCheckoutReference } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { CheckoutPage } from "@/features/checkout/components/CheckoutPage";

export default async function Page() {
  const reference = await getCheckoutReference();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Оформление заказа" }]}
      />
      <CheckoutPage reference={reference} />
    </>
  );
}
