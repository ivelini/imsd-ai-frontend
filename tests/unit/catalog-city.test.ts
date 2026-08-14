// Прокидывание city в мок-слой бэка (план catalog-city-param)
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCatalogProductsMock: vi.fn(() => ({
    items: [],
    total: 0,
    page: 1,
    perPage: 12,
  })),
  getSeoContentMock: vi.fn(() => ({
    title: "Шины",
    subtitle: "Viatti",
    features: [],
    advantages: "",
    sizes: [],
  })),
}));

vi.mock("@/data/catalog", () => ({
  getCatalogProductsMock: mocks.getCatalogProductsMock,
  getSeoContentMock: mocks.getSeoContentMock,
  // data/wheels.ts использует их на верхнем уровне (генерация ALL_WHEELS)
  COUNTRY_LABELS: {},
  DELIVERY_OPTIONS: [],
}));

import { getCatalogProducts } from "@/shared/api/catalog";
import { getSeoContent } from "@/shared/api/seo";

beforeEach(() => {
  mocks.getCatalogProductsMock.mockClear();
  mocks.getSeoContentMock.mockClear();
});

describe("city в контентных геттерах каталога", () => {
  it("test_catalog_products_passes_city_to_mock", async () => {
    await getCatalogProducts({}, "ekaterinburg");
    expect(mocks.getCatalogProductsMock).toHaveBeenCalledWith(
      {},
      "ekaterinburg",
    );
  });

  it("test_catalog_products_without_city", async () => {
    await getCatalogProducts({});
    expect(mocks.getCatalogProductsMock).toHaveBeenCalledWith({}, undefined);
  });

  it("test_seo_passes_city_to_mock", async () => {
    await getSeoContent("ekaterinburg");
    expect(mocks.getSeoContentMock).toHaveBeenCalledWith("ekaterinburg");
  });
});
