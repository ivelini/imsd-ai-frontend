// Оформление заказа (фаза 4)
import { getCheckoutOptions, getCartTotalInfo } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { CheckoutPage } from "@/features/checkout/components/CheckoutPage";

export default async function Page() {
  const [options, { benefits }] = await Promise.all([
    getCheckoutOptions(),
    getCartTotalInfo(),
  ]);

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Оформление заказа" }]}
      />
      <CheckoutPage options={options} benefits={benefits} />
    </>
  );
}
