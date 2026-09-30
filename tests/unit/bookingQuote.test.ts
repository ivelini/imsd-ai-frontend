// Итог записи и деньги: цена за единицу × количество, фолбэк на base_price, копейки
// (тест-лист плана booking-react-port, тесты 4–6)
import { describe, expect, it } from "vitest";

import { buildQuote, toQuoteItems } from "@/features/booking/lib/quote";
import { formatMoney } from "@/shared/lib/money";

describe("buildQuote (итог по строкам)", () => {
  it("test_total_sums_unit_price_times_quantity", () => {
    // цены и итог — в копейках: 30000 × 4 + 20000 × 2
    const quote = buildQuote([
      { id: 12, unitPrice: 30000, quantity: 4 },
      { id: 15, unitPrice: 20000, quantity: 2 },
    ]);

    expect(quote.total).toBe(160000);
  });
});

describe("toQuoteItems (цена услуги из каталога)", () => {
  it("test_falls_back_to_base_price_without_params", () => {
    // без пары радиус+тип бэк не отдаёт unit_price — строка обязана взять base_price, не ноль
    const withoutParams = toQuoteItems(
      [{ id: 7, name: "Балансировка", base_price: 30000 }],
      { 7: 4 },
    );

    expect(withoutParams[0].unitPrice).toBe(30000);
    expect(buildQuote(withoutParams).total).toBe(120000);
  });

  it("test_unit_price_wins_when_params_chosen", () => {
    const withParams = toQuoteItems(
      [{ id: 7, name: "Балансировка", base_price: 30000, unit_price: 25000 }],
      { 7: 4 },
    );

    expect(withParams[0].unitPrice).toBe(25000);
  });
});

describe("formatMoney (копейки → рубли)", () => {
  // ICU разделяет разряды неразрывным пробелом — нормализуем его в тесте, иначе
  // ожидание зависит от версии Node, а не от кода
  const plain = (s: string) => s.replace(/[  ]/g, " ");

  it("test_money_formats_kopecks_without_loss", () => {
    expect(plain(formatMoney(160050))).toBe("1 600,50 ₽");
    expect(formatMoney(160050)).not.toBe(formatMoney(160000));
  });

  it("test_whole_rubles_render_without_kopeck_tail", () => {
    // экраны магазина показывают цены в целых рублях — вид не должен поехать
    expect(plain(formatMoney(160000))).toBe("1 600 ₽");
  });
});
