// Живой API подбора по автомобилю (бэк, 20.10.2026).
// Справочники: /api/reference/vehicle/makes/{make}/models/{model}/…
// Результат: /api/catalog/tires|wheels/by-vehicle/{make}/{model}/{year}/{modification}.
// Адресация — слагами (бэк принимает и числовой id как fallback для старых ссылок);
// товары в ответе — те же поля, что в листинге, поэтому карточки проходят через
// общий toTireProduct/toWheelProduct.
import { apiBase } from "./base";
import { toTireProduct, toWheelProduct } from "./catalog";
import type { FilterState } from "@/features/catalog/types";
import type {
  VehicleMakeRef,
  VehicleMakesDto,
  VehicleModificationRef,
  VehicleModificationsDto,
  VehicleModificationsQuery,
  VehicleModelRef,
  VehicleModelsDto,
  VehicleSelection,
  VehicleSelectionDto,
  VehicleSelectionRef,
  VehicleWheelSelection,
  VehicleWheelSelectionDto,
  VehicleYearsDto,
} from "@/features/catalog/types/vehicle";

/** Категория справочника на бэке: tire | wheel (в UI — tires/wheels). */
export type VehicleApiCategory = "tire" | "wheel";

/** UI-категория → параметр бэка. */
export function toVehicleApiCategory(category: "tires" | "wheels"): VehicleApiCategory {
  return category === "wheels" ? "wheel" : "tire";
}

function categoryQuery(category: VehicleApiCategory): string {
  return category === "wheel" ? "category=wheel" : "";
}

function withQuery(path: string, parts: string[]): string {
  const query = parts.filter(Boolean).join("&");
  return query ? `${path}?${query}` : path;
}

/** Общий запрос справочника: 404 (неизвестный слаг/id) → null, остальные ошибки — исключение. */
async function getVehicleJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${apiBase()}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getVehicle: HTTP ${res.status} (${path})`);
  return (await res.json()) as T;
}

export async function getVehicleMakes(
  category: VehicleApiCategory = "tire",
): Promise<VehicleMakeRef[] | null> {
  const body = await getVehicleJson<VehicleMakesDto>(
    withQuery("/reference/vehicle/makes", [categoryQuery(category)]),
  );
  return body?.data ?? null;
}

export async function getVehicleModels(
  make: string,
  category: VehicleApiCategory = "tire",
): Promise<VehicleModelRef[] | null> {
  const body = await getVehicleJson<VehicleModelsDto>(
    withQuery(
      `/reference/vehicle/makes/${encodeURIComponent(make)}/models`,
      [categoryQuery(category)],
    ),
  );
  return body?.data ?? null;
}

export async function getVehicleYears(
  make: string,
  model: string,
  category: VehicleApiCategory = "tire",
): Promise<number[] | null> {
  const body = await getVehicleJson<VehicleYearsDto>(
    withQuery(
      `/reference/vehicle/makes/${encodeURIComponent(make)}/models/${encodeURIComponent(model)}/years`,
      [categoryQuery(category)],
    ),
  );
  return body?.data ?? null;
}

export async function getVehicleModifications(
  query: VehicleModificationsQuery,
  category: VehicleApiCategory = "tire",
): Promise<VehicleModificationRef[] | null> {
  const body = await getVehicleJson<VehicleModificationsDto>(
    withQuery(
      `/reference/vehicle/makes/${encodeURIComponent(query.make)}/models/${encodeURIComponent(query.model)}/modifications`,
      [`year=${query.year}`, categoryQuery(category)],
    ),
  );
  return body?.data ?? null;
}

/**
 * Query результата подбора: город и фильтры сайдбара (цена/доставка/страна).
 * Размер задаёт автомобиль — width/profile/diameter/model/page сюда не попадают
 * (бэк отвечает на них 422).
 */
export function toVehicleSelectionQuery(filter: FilterState, city?: string): string {
  const params = new URLSearchParams();

  if (filter.priceMin !== undefined) params.append("price_min", String(filter.priceMin));
  if (filter.priceMax !== undefined) params.append("price_max", String(filter.priceMax));
  filter.delivery?.forEach((value) => params.append("delivery[]", value));
  if (filter.country) params.append("country", filter.country);
  if (city) params.append("city", city);

  // PHP parse_str ждёт каноничный вид delivery[]= (не %5B%5D)
  return params.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
}

/** DTO результата → доменные секции; товары — через общий адаптер карточки. */
export function toVehicleSelection(dto: VehicleSelectionDto): VehicleSelection {
  return {
    vehicle: dto.data.vehicle,
    sections: dto.data.sections.map((section) => ({
      type: section.type,
      carBlockLabel: section.car_block_label,
      resultLabel: section.result_label,
      options: section.options.map((option) => ({
        key: option.key,
        label: option.label,
        sizes: option.sizes,
        offers: option.offers.map((offer) => ({
          front: toTireProduct(offer.front),
          rear: offer.rear ? toTireProduct(offer.rear) : null,
        })),
        offersTotal: option.offers_total,
      })),
    })),
    city: dto.meta.city,
    seo: dto.meta.seo,
    offersPerOption: dto.meta.offers_per_option,
    totalOffers: dto.meta.total_offers,
  };
}

/** Путь результата: /by-vehicle/{make}/{model}/{year}/{modification}. */
function vehicleSelectionPath(
  resource: "tires" | "wheels",
  vehicle: VehicleSelectionRef,
): string {
  return `/catalog/${resource}/by-vehicle/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}/${vehicle.year}/${encodeURIComponent(vehicle.modification)}`;
}

/** Результат подбора шин: 404 → null (страница отдаёт notFound). */
export async function getVehicleTireSelection(
  vehicle: VehicleSelectionRef,
  filter: FilterState,
  city?: string,
): Promise<VehicleSelection | null> {
  const query = toVehicleSelectionQuery(filter, city);
  const path = `${vehicleSelectionPath("tires", vehicle)}${query ? `?${query}` : ""}`;

  const res = await fetch(`${apiBase()}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getVehicleTireSelection: HTTP ${res.status}`);

  return toVehicleSelection((await res.json()) as VehicleSelectionDto);
}

/** DTO результата подбора дисков → доменные секции; товары — через toWheelProduct. */
export function toWheelSelection(dto: VehicleWheelSelectionDto): VehicleWheelSelection {
  return {
    vehicle: dto.data.vehicle,
    sections: dto.data.sections.map((section) => ({
      type: section.type,
      carBlockLabel: section.car_block_label,
      resultLabel: section.result_label,
      options: section.options.map((option) => ({
        key: option.key,
        label: option.label,
        sizes: option.sizes,
        offers: option.offers.map((offer) => ({
          front: toWheelProduct(offer.front),
          rear: offer.rear ? toWheelProduct(offer.rear) : null,
        })),
        offersTotal: option.offers_total,
      })),
    })),
    city: dto.meta.city,
    seo: dto.meta.seo,
    offersPerOption: dto.meta.offers_per_option,
    totalOffers: dto.meta.total_offers,
  };
}

/** Результат подбора дисков: 404 → null (страница отдаёт notFound). */
export async function getVehicleWheelSelection(
  vehicle: VehicleSelectionRef,
  filter: FilterState,
  city?: string,
): Promise<VehicleWheelSelection | null> {
  const query = toVehicleSelectionQuery(filter, city);
  const path = `${vehicleSelectionPath("wheels", vehicle)}${query ? `?${query}` : ""}`;

  const res = await fetch(`${apiBase()}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getVehicleWheelSelection: HTTP ${res.status}`);

  return toWheelSelection((await res.json()) as VehicleWheelSelectionDto);
}
