// QueryKey-конвенция: ['domain', 'entity', ...params]
// Только для клиентских хуков React Query (корзина, город, ЛК)

export const queryKeys = {
  layout: {
    geo: ["layout", "geo"] as const,
  },
  cart: {
    items: ["cart", "items"] as const,
  },
  account: {
    // placeholder для будущих хуков ЛК
  },
} as const;
