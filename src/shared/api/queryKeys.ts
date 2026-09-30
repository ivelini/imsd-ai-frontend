// QueryKey-конвенция: ['domain', 'entity', ...params]
// Только для клиентских хуков React Query (корзина, город, ЛК)

export const queryKeys = {
  layout: {
    geo: ["layout", "geo"] as const,
  },
  catalog: {
    filterOptions: ["catalog", "filter-options"] as const,
    wheelsFilterOptions: ["catalog", "wheels-filter-options"] as const,
    auto: {
      models: (category: string, brand: string) =>
        ["auto", "models", category, brand] as const,
      years: (category: string, brand: string, model: string) =>
        ["auto", "years", category, brand, model] as const,
      mods: (category: string, brand: string, model: string, year: string) =>
        ["auto", "mods", category, brand, model, year] as const,
    },
  },
  cart: {
    items: ["cart", "items"] as const,
  },
  checkout: {
    order: ["checkout", "order"] as const,
  },
  auth: {
    session: ["auth", "session"] as const,
  },
  booking: {
    reference: ["booking", "reference"] as const,
    days: (dateFrom: string, dateTo: string) => ["booking", "days", dateFrom, dateTo] as const,
    daySlots: (date: string) => ["booking", "day-slots", date] as const,
    catalog: (radius: number | null, carType: string | null) =>
      ["booking", "catalog", radius, carType] as const,
  },
  account: {
    // placeholder для будущих хуков ЛК
  },
} as const;
