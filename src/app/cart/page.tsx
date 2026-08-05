// Корзина (фаза 4)
import { getCartTotalInfo } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { CartPage } from "@/features/cart/components/CartPage";

export default async function Page() {
  const { benefits } = await getCartTotalInfo();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Корзина" }]}
      />
      <CartPage benefits={benefits} />
    </>
  );
}
