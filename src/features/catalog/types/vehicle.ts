// Типы живого подбора по автомобилю (API бэка, 20.10.2026).
// DTO повторяют ответы /api/reference/vehicle/* и /api/catalog/tires/by-vehicle/*;
// доменные типы — camelCase для компонентов (товары — общий TireProduct).
import type {
  TireListItemDto,
  TireProduct,
  WheelListItemDto,
  WheelProduct,
} from "./index";
import type { ArticleBlockData, ArticleBlockDto } from "@/shared/types/articleBlock";

// ── Справочники каскада ────────────────────────────────────────────────

export interface VehicleMakeRef {
  id: number;
  slug: string;
  name: string;
}

export interface VehicleModelRef {
  id: number;
  slug: string;
  name: string;
  /** Человекочитаемое имя с поколением: «MDX II (YD2)». */
  label: string;
  generation: string | null;
}

export interface VehicleModificationRef {
  id: number;
  slug: string;
  name: string;
  label: string;
}

/** Модификация в ответе подбора: id, слаг и имя (без label). */
export interface VehicleModificationBrief {
  id: number;
  slug: string;
  name: string;
}

/** Ключ результата подбора: слаги марки/модели/модификации + год. */
export interface VehicleSelectionRef {
  make: string;
  model: string;
  year: number;
  modification: string;
}

/** Запрос модификаций: марка и модель слагами, год числом. */
export interface VehicleModificationsQuery {
  make: string;
  model: string;
  year: number;
}

export interface VehicleMakesDto {
  data: VehicleMakeRef[];
  meta: { total: number };
}

export interface VehicleModelsDto {
  data: VehicleModelRef[];
  meta: { total: number };
}

export interface VehicleYearsDto {
  data: number[];
  meta: { total: number };
}

export interface VehicleModificationsDto {
  data: VehicleModificationRef[];
  meta: { year: number; total: number };
}

// ── Результат подбора ──────────────────────────────────────────────────

export interface VehicleSize {
  width: number;
  profile: number;
  diameter: string;
  position: string | null;
}

export interface VehicleSelectionVehicle {
  make: VehicleMakeRef;
  model: VehicleModelRef;
  modification: VehicleModificationBrief;
  year: number | null;
  title: string;
}

export interface VehicleCity {
  id: number;
  slug: string | null;
  name: string;
}

export interface VehicleSeo {
  title: string;
  description: string | null;
}

export interface VehicleOfferDto {
  front: TireListItemDto;
  rear: TireListItemDto | null;
}

export interface VehicleOptionDto {
  key: string;
  label: string;
  sizes: VehicleSize[];
  offers: VehicleOfferDto[];
  offers_total: number;
}

export interface VehicleSectionDto {
  type: string;
  car_block_label: string;
  result_label: string;
  options: VehicleOptionDto[];
}

export interface VehicleSelectionMeta {
  city: VehicleCity;
  seo: VehicleSeo;
  offers_per_option: number;
  total_offers: number;
}

export interface VehicleSelectionDto {
  data: {
    vehicle: VehicleSelectionVehicle;
    sections: VehicleSectionDto[];
  };
  meta: VehicleSelectionMeta;
  /** Блок статьи в корне ответа; поля нет — блока нет. */
  article?: ArticleBlockDto | null;
}

// ── Доменные типы для компонентов ──────────────────────────────────────

export interface VehicleOffer {
  front: TireProduct;
  rear: TireProduct | null;
}

export interface VehicleOption {
  key: string;
  label: string;
  sizes: VehicleSize[];
  offers: VehicleOffer[];
  offersTotal: number;
}

export interface VehicleSection {
  type: string;
  carBlockLabel: string;
  resultLabel: string;
  options: VehicleOption[];
}

export interface VehicleSelection {
  vehicle: VehicleSelectionVehicle;
  sections: VehicleSection[];
  city: VehicleCity;
  seo: VehicleSeo;
  offersPerOption: number;
  totalOffers: number;
  article: ArticleBlockData | null;
}

// ── Диски: спецификация вместо шинного размера ─────────────────────────

export interface VehicleWheelSize {
  width: string;
  diameter: number;
  et: string;
  pcd: string;
  hub_diameter: string;
  bolts: string | null;
  position: string | null;
}

export interface VehicleWheelOfferDto {
  front: WheelListItemDto;
  rear: WheelListItemDto | null;
}

export interface VehicleWheelOptionDto {
  key: string;
  label: string;
  sizes: VehicleWheelSize[];
  offers: VehicleWheelOfferDto[];
  offers_total: number;
}

export interface VehicleWheelSectionDto {
  type: string;
  car_block_label: string;
  result_label: string;
  options: VehicleWheelOptionDto[];
}

export interface VehicleWheelSelectionDto {
  data: {
    vehicle: VehicleSelectionVehicle;
    sections: VehicleWheelSectionDto[];
  };
  meta: VehicleSelectionMeta;
  /** Блок статьи в корне ответа; поля нет — блока нет. */
  article?: ArticleBlockDto | null;
}

export interface VehicleWheelOffer {
  front: WheelProduct;
  rear: WheelProduct | null;
}

export interface VehicleWheelOption {
  key: string;
  label: string;
  sizes: VehicleWheelSize[];
  offers: VehicleWheelOffer[];
  offersTotal: number;
}

export interface VehicleWheelSection {
  type: string;
  carBlockLabel: string;
  resultLabel: string;
  options: VehicleWheelOption[];
}

export interface VehicleWheelSelection {
  vehicle: VehicleSelectionVehicle;
  sections: VehicleWheelSection[];
  city: VehicleCity;
  seo: VehicleSeo;
  offersPerOption: number;
  totalOffers: number;
  article: ArticleBlockData | null;
}
