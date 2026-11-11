// Блок статьи в зонах витрины (тест-листы планов article-block-zones, article-route-texts-frontend)
// Контракт: article?: string в корне ответа; ключа нет — блока нет; HTML — как отдал RichEditor бэка.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockFetch } from "./helpers/mockFetch";
import { toArticleBlock } from "@/shared/lib/articleBlock";
import { getCatalogProducts, getModelCard, getWheelsProducts } from "@/shared/api/catalog";
import { getVehicleTireSelection, getVehicleWheelSelection } from "@/shared/api/vehicle";
import { getProduct } from "@/shared/api/product";
import type { TireProductDto } from "@/features/product/types";
import type { VehicleSelectionRef } from "@/features/catalog/types/vehicle";

const city = { id: 1, slug: "chelyabinsk", name: "Челябинск" };

const vehicle = {
  make: { id: 1, slug: "acura", name: "Acura" },
  model: { id: 1, slug: "integra", name: "Integra", label: "Integra", generation: null },
  modification: { id: 1, slug: "1-8i", name: "1.8i" },
  year: 1999,
  title: "Acura Integra 1.8i 1999",
};

const vehicleMeta = {
  city,
  seo: { title: "Шины для Acura Integra", description: null },
  offers_per_option: 2,
  total_offers: 0,
};

const modelDto = {
  slug: "bluearth-e70b",
  name: "Bluearth E70B",
  brand: { id: 3, name: "Yokohama", slug: "yokohama" },
  image_url: null,
  params: [],
  description: null,
  diameters: [],
};

const tireDto: TireProductDto = {
  id: 188,
  ean: null,
  name: "Шина Yokohama Bluearth E70B 215/55 R17 94V",
  slug: "yokohama-bluearth-e70b-215-55-r17-94v",
  brand: { id: 3, name: "Yokohama", slug: "yokohama" },
  model: { id: 60, name: "Bluearth E70B", slug: "bluearth-e70b" },
  origin: null,
  width: 215,
  profile: 55,
  diameter: "17",
  season: { label: "Летняя", value: "summer" },
  is_studded: false,
  euro_label: null,
  price: 11100,
  old_price: null,
  promotion: false,
  images: [],
  load_index: null,
  speed_index: null,
  is_runflat: false,
  description: null,
  delivery: null,
  count_in_stock: 4,
};

const storeDto = {
  delivery_label: "бесплатно",
  availability_text: "Товар в наличии.",
  delivery_text: "Доставка транспортной компанией.",
  warranty_text: "Гарантия производителя.",
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toArticleBlock", () => {
  it("test_absent_article_gives_null", () => {
    expect(toArticleBlock(undefined)).toBeNull();
    expect(toArticleBlock(null)).toBeNull();
    // пустая строка — тоже «текста нет»: заглушку не выводим
    expect(toArticleBlock("")).toBeNull();
  });

  it("test_html_string_maps_to_content", () => {
    const html = "<h2>Aplus A503</h2><p>Текст <b>жирный</b></p>";

    expect(toArticleBlock(html)).toEqual({ contentHtml: html });
  });
});

describe("article в корне ответа", () => {
  it("test_tire_list_carries_article", async () => {
    mockFetch(() => ({
      status: 200,
      body: {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 0, seo: null },
        article: "<p>A</p>",
      },
    }));

    const result = await getCatalogProducts({}, "chelyabinsk");

    expect(result.article).toEqual({ contentHtml: "<p>A</p>" });
  });

  it("test_wheel_list_carries_article", async () => {
    mockFetch(() => ({
      status: 200,
      body: {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 0, seo: null },
        article: "<p>W</p>",
      },
    }));

    const result = await getWheelsProducts({}, "chelyabinsk");

    expect(result.article).toEqual({ contentHtml: "<p>W</p>" });
  });

  it("test_tire_selection_carries_article", async () => {
    const vehicleRef: VehicleSelectionRef = {
      make: "acura",
      model: "integra",
      year: 1999,
      modification: "1-8i",
    };

    mockFetch(() => ({
      status: 200,
      body: { data: { vehicle, sections: [] }, meta: vehicleMeta, article: "<p>T</p>" },
    }));
    const withArticle = await getVehicleTireSelection(vehicleRef, {}, "chelyabinsk");

    mockFetch(() => ({
      status: 200,
      body: { data: { vehicle, sections: [] }, meta: vehicleMeta },
    }));
    const withoutArticle = await getVehicleTireSelection(vehicleRef, {}, "chelyabinsk");

    expect(withArticle?.article).toEqual({ contentHtml: "<p>T</p>" });
    expect(withoutArticle?.article).toBeNull();
  });

  it("test_wheel_selection_carries_article", async () => {
    const vehicleRef: VehicleSelectionRef = {
      make: "acura",
      model: "integra",
      year: 1999,
      modification: "1-8i",
    };

    mockFetch(() => ({
      status: 200,
      body: { data: { vehicle, sections: [] }, meta: vehicleMeta, article: "<p>V</p>" },
    }));
    const withArticle = await getVehicleWheelSelection(vehicleRef, {}, "chelyabinsk");

    mockFetch(() => ({
      status: 200,
      body: { data: { vehicle, sections: [] }, meta: vehicleMeta },
    }));
    const withoutArticle = await getVehicleWheelSelection(vehicleRef, {}, "chelyabinsk");

    expect(withArticle?.article).toEqual({ contentHtml: "<p>V</p>" });
    expect(withoutArticle?.article).toBeNull();
  });

  it("test_model_result_carries_article", async () => {
    mockFetch(() => ({
      status: 200,
      body: { data: modelDto, meta: { seo: null }, article: "<p>M</p>" },
    }));
    const withArticle = await getModelCard({
      category: "tires",
      brandSlug: "yokohama",
      modelSlug: "bluearth-e70b",
      city: "chelyabinsk",
    });

    mockFetch(() => ({
      status: 200,
      body: { data: modelDto, meta: { seo: null } },
    }));
    const withoutArticle = await getModelCard({
      category: "tires",
      brandSlug: "yokohama",
      modelSlug: "bluearth-e70b",
      city: "chelyabinsk",
    });

    expect(withArticle?.article).toEqual({ contentHtml: "<p>M</p>" });
    expect(withoutArticle?.article).toBeNull();
  });

  it("test_wheel_model_result_carries_article", async () => {
    mockFetch(() => ({
      status: 200,
      body: { data: modelDto, meta: { seo: null }, article: "<p>W</p>" },
    }));
    const withArticle = await getModelCard({
      category: "wheels",
      brandSlug: "hankook",
      modelSlug: "kinergy",
    });

    mockFetch(() => ({
      status: 200,
      body: { data: modelDto, meta: { seo: null } },
    }));
    const withoutArticle = await getModelCard({
      category: "wheels",
      brandSlug: "hankook",
      modelSlug: "kinergy",
    });

    expect(withArticle?.article).toEqual({ contentHtml: "<p>W</p>" });
    expect(withoutArticle?.article).toBeNull();
  });

  it("test_product_result_carries_article", async () => {
    const route = {
      category: "tires" as const,
      brand: "yokohama",
      model: "bluearth-e70b",
      size: "yokohama-bluearth-e70b-215-55-r17-94v",
    };

    mockFetch((url) =>
      url.includes("/reference/store")
        ? { status: 200, body: { data: storeDto } }
        : { status: 200, body: { data: tireDto, meta: { seo: null }, article: "<p>P</p>" } },
    );
    const withArticle = await getProduct(route, "chelyabinsk");

    mockFetch((url) =>
      url.includes("/reference/store")
        ? { status: 200, body: { data: storeDto } }
        : { status: 200, body: { data: tireDto, meta: { seo: null } } },
    );
    const withoutArticle = await getProduct(route, "chelyabinsk");

    expect(withArticle?.article).toEqual({ contentHtml: "<p>P</p>" });
    expect(withoutArticle?.article).toBeNull();
  });
});
