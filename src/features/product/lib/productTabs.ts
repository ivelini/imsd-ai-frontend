// Вкладки карточки товара: вкладка есть, только если у неё есть контент (22.10.2026).
// «Отзывы» бэк не отдаёт — вкладки нет; «Оплата» секции не имеет (как в макете).
export interface ProductTab {
  id: "description" | "availability" | "delivery" | "warranty" | "payment";
  label: string;
  mobileVisible: boolean;
}

export function productTabs(product: {
  description: string | null;
  availabilityText: string;
  deliveryText: string;
  warrantyText: string;
}): ProductTab[] {
  const tabs: ProductTab[] = [];

  if (product.description) {
    tabs.push({ id: "description", label: "Описание", mobileVisible: true });
  }
  if (product.availabilityText) {
    tabs.push({ id: "availability", label: "НАЛИЧИЕ", mobileVisible: true });
  }
  if (product.deliveryText) {
    tabs.push({ id: "delivery", label: "Доставка", mobileVisible: true });
  }
  if (product.warrantyText) {
    tabs.push({ id: "warranty", label: "Гарантия", mobileVisible: false });
  }

  tabs.push({ id: "payment", label: "Оплата", mobileVisible: false });

  return tabs;
}
