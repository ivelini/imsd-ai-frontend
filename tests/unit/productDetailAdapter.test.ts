// Адаптер карточки товара: живой API → ProductDetailData (тест-лист плана product-card-live)
// Контракт бэка 22.10.2026: GET /api/catalog/tires/{brand}/{model}/{size},
// GET /api/catalog/wheels/{brand}/{size}, GET /api/reference/store
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockFetch } from "./helpers/mockFetch";
import { getProduct, toProductDetail } from "@/shared/api/product";
import type {
  StoreSettings,
  TireProductDto,
  WheelProductDto,
} from "@/features/product/types";

const store: StoreSettings = {
  deliveryLabel: "бесплатно",
  availabilityText: "Товар в наличии.",
  deliveryText: "Доставка транспортной компанией.",
  warrantyText: "Гарантия производителя.",
};

const tireDto: TireProductDto = {
  id: 188,
  ean: "AA-00093922",
  name: "Шина летняя Yokohama Bluearth E70B 215/55 R17 94V",
  slug: "yokohama-bluearth-e70b-215-55-r17-94v",
  brand: { id: 3, name: "Yokohama", slug: "yokohama" },
  model: { id: 60, name: "Bluearth E70B", slug: "bluearth-e70b" },
  origin: {
    vendor: { badge: "Yokohama Rubber Company", description: "<p>Японский производитель.</p>" },
    manufacture_country: { badge: "Япония", description: null },
    manufacture_year: { badge: "2024-2025", description: null },
    delivery_days_after_order: {
      badge: "24 Окт (Сб)",
      description:
        "Самовывоз осуществляется из центрального офиса\nАдрес: Свердловский тракт 3Н (Автоальянс)\nВремя работы: 09:00-19:00 09:00-14:00 (сб)",
    },
    pick_up: { pick_up_point: { badge: "бесплатно", description: "Доставка по городу" } },
  },
  width: 215,
  profile: 55,
  diameter: "17",
  season: { label: "Летняя", value: "summer" },
  is_studded: true,
  euro_label: null,
  price: 11100,
  old_price: 11900,
  promotion: true,
  images: [
    { id: 1, url: "http://localhost:8081/storage/images/a.jpg" },
    { id: 2, url: "http://localhost:8081/storage/images/b.jpg" },
  ],
  load_index: "94",
  speed_index: "V",
  is_runflat: false,
  description: "Описание модели шины.",
  delivery: { delivery_min: 1, delivery_max: 2, delivery_days_after_order: 2 },
  count_in_stock: 40,
};

const wheelDto: WheelProductDto = {
  id: 195,
  ean: "AA-00075055",
  name: "Диск LS 367 16x7/4x100 D73,1 ET40 GMF",
  slug: "ls-disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1",
  brand: { id: 12, name: "LS", slug: "ls" },
  model: { id: 124, name: "LS 367", slug: "ls-367" },
  origin: {
    vendor: { badge: "LS", description: null },
    manufacture_country: null,
    manufacture_year: null,
    delivery_days_after_order: { badge: "24 Окт (Сб)", description: "Самовывоз из офиса" },
    pick_up: { pick_up_point: { badge: "бесплатно", description: "Доставка по городу" } },
  },
  width: "7.0",
  diameter: 16,
  pcd: "4*100",
  et: "40.0",
  hub_diameter: "73.1",
  type: { label: "Литые", value: "alloy" },
  color: "Темный (серый)",
  price: 12600,
  old_price: 13900,
  promotion: true,
  images: [{ id: 571, url: "http://localhost:8081/storage/images/ls.jpg" }],
  description: null,
  delivery: { delivery_min: 1, delivery_max: 2, delivery_days_after_order: 2 },
  count_in_stock: 4,
};

function paramValue(parameters: { name: string; value: string }[], name: string): string | undefined {
  return parameters.find((p) => p.name === name)?.value;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toProductDetail", () => {
  it("test_map_tire_product_dto", () => {
    const product = toProductDetail(tireDto, store);

    expect(product.category).toBe("tires");
    expect(product.title).toBe(tireDto.name);
    expect(product.images).toEqual([
      "http://localhost:8081/storage/images/a.jpg",
      "http://localhost:8081/storage/images/b.jpg",
    ]);
    expect(product.price).toBe(11100);
    expect(product.oldPrice).toBe(11900);
    expect(product.quantity).toBe(40);

    expect(paramValue(product.parameters, "Код товара:")).toBe("AA-00093922");
    expect(paramValue(product.parameters, "Индекс скорости и нагрузки:")).toBe("94V");
    expect(paramValue(product.parameters, "Шипы:")).toBe("Да");
    expect(paramValue(product.parameters, "Run flat:")).toBe("Нет");
    // «Страны бренда» в данных нет — строка не выводится
    expect(product.parameters.some((p) => p.name === "Страна бренда:")).toBe(false);

    // крошки: позиция модели (имя + слаг страницы модели)
    expect(product.modelName).toBe("Bluearth E70B");
    expect(product.modelSlug).toBe("bluearth-e70b");

    // дата выдачи — готовая строка бэка, фронт её не вычисляет
    expect(product.pickupDate).toBe("24 Окт (Сб)");
    expect(product.deliveryLabel).toBe("бесплатно");
    // блок самовывоза: городозависимый текст бэка — адрес и часы внутри
    expect(product.pickupPointText).toBe(
      "Самовывоз осуществляется из центрального офиса\nАдрес: Свердловский тракт 3Н (Автоальянс)\nВремя работы: 09:00-19:00 09:00-14:00 (сб)",
    );
    expect(product.availabilityText).toBe(store.availabilityText);
    expect(product.description).toBe("Описание модели шины.");
  });

  it("test_map_wheel_product_dto", () => {
    const product = toProductDetail(wheelDto, store);

    expect(product.category).toBe("wheels");
    expect(product.title).toBe(wheelDto.name);
    expect(product.price).toBe(12600);
    expect(product.quantity).toBe(4);

    expect(paramValue(product.parameters, "PCD:")).toBe("4x100");
    expect(paramValue(product.parameters, "Вылет (ET):")).toBe("40");
    expect(paramValue(product.parameters, "Диаметр ступицы:")).toBe("73.1");
    expect(paramValue(product.parameters, "Тип диска:")).toBe("Литые");

    // сезонных полей у диска нет; описания у модели может не быть
    expect(product.season).toBeUndefined();
    expect(product.description).toBeNull();
    expect(product.modelName).toBe("LS 367");
    expect(product.pickupPointText).toBe("Самовывоз из офиса");
  });

  it("test_badges_pass_through_to_product_detail", () => {
    const product = toProductDetail(
      {
        ...tireDto,
        badges: [
          { text: "Хит продаж", color: "red", icon_key: null, link: null, owner_type: "model", owner_name: "BEL-307" },
          { text: "Новинка", color: "gold", icon_key: "gold", link: "https://aalyans.ru", owner_type: "brand", owner_name: "Kama" },
        ],
      },
      store,
    );

    // стек приходит готовым: фронт не фильтрует и не сортирует (сортировка на бэке)
    expect(product.badges).toHaveLength(2);
    expect(product.badges[0].text).toBe("Хит продаж");
    expect(product.badges[1].color).toBe("gold");
  });

  it("test_missing_badges_field_yields_empty_stack", () => {
    // фикстура tireDto — без поля badges (откат бэка на прошлую версию)
    const product = toProductDetail(tireDto, store);

    expect(product.badges).toEqual([]);
  });
});

describe("getProduct (живой fetch)", () => {
  it("test_product_404_returns_null", async () => {
    const fetchFn = mockFetch(() => ({ status: 404, body: { message: "Товар не найден" } }));

    const result = await getProduct(
      { category: "tires", brand: "yokohama", model: "bluearth-e70b", size: "yokohama-bluearth-e70b-215-55-r17-94v" },
      "chelyabinsk",
    );

    // 404 — ответ API, а не промах мок-справочника: запрос должен уйти
    expect(fetchFn).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("test_store_failure_keeps_product", async () => {
    mockFetch((url) =>
      url.includes("/reference/store")
        ? { status: 500, body: { message: "Настройка не засеяна: store_hours" } }
        : { status: 200, body: { data: tireDto, meta: { seo: { title: "SEO", description: null } } } },
    );

    const result = await getProduct(
      { category: "tires", brand: "yokohama", model: "bluearth-e70b", size: "yokohama-bluearth-e70b-215-55-r17-94v" },
      "chelyabinsk",
    );

    expect(result).not.toBeNull();
    expect(result?.product.availabilityText).toBe("");
    expect(result?.product.deliveryText).toBe("");
    expect(result?.product.warrantyText).toBe("");
    expect(result?.product.deliveryLabel).toBe("");
  });

  it("test_product_request_passes_city", async () => {
    const fetchFn = mockFetch((url) =>
      url.includes("/reference/store")
        ? { status: 200, body: { data: { shop_address: "", store_hours: "", delivery_label: "", availability_text: "", delivery_text: "", warranty_text: "" } } }
        : { status: 200, body: { data: tireDto, meta: { seo: null } } },
    );

    await getProduct(
      { category: "wheels", brand: "ls", size: "disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1" },
      "chelyabinsk",
    );

    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining("/catalog/wheels/ls/"));
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining("city=chelyabinsk"));
  });
});
