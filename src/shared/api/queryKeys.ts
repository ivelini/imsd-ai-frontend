// QueryKey-конвенция: ['domain', 'entity', ...params]
// Только для клиентских хуков React Query (корзина, город, ЛК)

// Корень реплик чата: префикс для инвалидации всех диалогов (токенов) одним вызовом
const chatMessagesKey = ["chat", "messages"] as const;

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
    items: (city: string) => ["cart", "items", city] as const,
  },
  checkout: {
    reference: ["checkout", "reference"] as const,
    deliveryPoints: (city: string) => ["checkout", "delivery-points", city] as const,
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
  chat: {
    all: chatMessagesKey,
    messages: (token: string | null) => [...chatMessagesKey, token] as const,
  },
  account: {
    // placeholder для будущих хуков ЛК
  },
} as const;
