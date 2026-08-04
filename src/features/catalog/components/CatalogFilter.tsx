// Панель фильтров каталога: .catalog-panel + #filter-in-catalog (фаза 2)
// Разметка 1-в-1 с .template/catalog/index.html
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FilterOptions, FilterState } from "@/features/catalog/types";
import { buildCatalogUrl, buildQueryString } from "@/shared/lib/parseParams";
import { useAutoBrands } from "@/features/catalog/api/useAutoBrands";
import { useFilterStore } from "@/stores/useFilterStore";
import { useCity } from "@/shared/layout/api/useCity";
import { PriceSlider } from "./PriceSlider";

export interface AutoFilterData {
  brand?: string; // id марки (bmw, audi...)
  brandName?: string;
  model?: string; // slug модели
  modelName?: string;
  year?: string;
  mod?: string; // id модификации
  modName?: string;
  models?: { slug: string; name: string }[]; // опции моделей (с сервера каскада)
  years?: number[]; // опции годов
  modifications?: { id: string; name: string }[]; // опции модификаций
}

interface CatalogFilterProps {
  options: FilterOptions;
  current: FilterState;
  /** Активная вкладка по умолчанию (страницы автоподбора → "car") */
  initialTab?: "params" | "car";
  /** Текущий выбор каскада авто (заполняет селекты вкладки «По автомобилю») */
  autoData?: AutoFilterData;
  /** true на странице каталога: URL — источник истины, стор синхронизируется из URL.
      false на каскаде авто: URL чистый, значения из стора (память фильтра). */
  trackUrl?: boolean;
}

function SelectArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="6" viewBox="0 0 9 6" fill="none">
      <path d="M8 1L4.5 5L1 0.999999" stroke="#C5C5C5" strokeLinecap="round" />
    </svg>
  );
}

function CatSelect({ id, value, onChange, placeholder, children }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="custom-select-wrapper custom-select-wrapper-cat">
      <select className="custom-select custom-select-cat" id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="0">{placeholder}</option>
        {children}
      </select>
      <div className="select-arrow">
        <SelectArrow />
      </div>
    </div>
  );
}

export function CatalogFilter({ options, current, initialTab = "params", autoData, trackUrl = false }: CatalogFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cityLabel, cityValue, setGeoOpen } = useCity();
  // На мобиле фильтр скрыт до клика по «Фильтры» (на десктопе CSS показывает всегда)
  const [open, setOpen] = useState(false);
  // Вкладка: «По параметрам» / «По автомобилю»
  const [tab, setTab] = useState<"params" | "car">(initialTab);
  // Марки авто для вкладки «По автомобилю»
  const { data: autoBrands } = useAutoBrands();
  // Память фильтров: отдельные значения для каждой вкладки
  const filterParams = useFilterStore((s) => s.filterParams);
  const setFilterParams = useFilterStore((s) => s.setFilterParams);
  const filterAuto = useFilterStore((s) => s.filterAuto);
  const setFilterAuto = useFilterStore((s) => s.setFilterAuto);
  // Память выбора авто-каскада (марка/модель/год/модификация)
  const storedAuto = useFilterStore((s) => s.autoFilter);
  const setStoredAuto = useFilterStore((s) => s.setAutoFilter);
  const resetFilterParams = useFilterStore((s) => s.resetFilterParams);
  const resetFilterAuto = useFilterStore((s) => s.resetFilterAuto);
  const resetAuto = useFilterStore((s) => s.resetAutoFilter);

  // URL — источник истины для соответствующей вкладки:
  // каталог (trackUrl) → filterParams; каскад → filterAuto
  useEffect(() => {
    if (trackUrl) setFilterParams(current);
    else setFilterAuto(current);
  }, [trackUrl, current, setFilterParams, setFilterAuto]);

  // На каскаде: запоминаем текущий выбор авто из сегментов URL (для возврата на вкладку)
  useEffect(() => {
    if (!trackUrl && autoData?.brand) {
      setStoredAuto({
        brand: autoData.brand,
        model: autoData.model,
        year: autoData.year,
        mod: autoData.mod,
      });
    }
  }, [trackUrl, autoData?.brand, autoData?.model, autoData?.year, autoData?.mod, setStoredAuto]);

  // Актуальные значения: зависят от вкладки (цена/доставка/страна — раздельные)
  const effective: FilterState = tab === "params" ? filterParams : filterAuto;

  /** Переход по каскаду авто при выборе в селекте — с query-фильтрами вкладки авто */
  const goAuto = (path: string, value: string) => {
    if (value && value !== "0") router.push(`${path}${buildQueryString(filterAuto, false, cityValue)}`);
  };

  /** Переключение вкладки: URL каждой вкладки собирается из своей памяти */
  const switchTab = (next: "params" | "car") => {
    if (next === "params") {
      router.push(buildCatalogUrl(filterParams, cityValue));
    } else {
      const { brand, model, year, mod } = storedAuto;
      const qs = buildQueryString(filterAuto, false, cityValue);
      if (brand) {
        const path = ["catalog", "tires", "auto", brand, model ?? "", year ?? "", mod ?? ""]
          .filter(Boolean)
          .join("/");
        router.push(`/${path}${qs}`);
      } else {
        router.push(`/catalog/tires/auto${qs}`);
      }
    }
    setTab(next);
  };

  /** Применение фильтра: в стор своей вкладки + URL своей вкладки */
  function apply(overrides: Partial<FilterState>) {
    const next = { ...effective, ...overrides };
    if (tab === "params") {
      setFilterParams(next);
      router.push(buildCatalogUrl(next, cityValue));
    } else {
      setFilterAuto(next);
      // На каскаде — текущий путь + query; на каталоге (вкладка авто) — переход на каскад
      const autoPath = pathname.startsWith("/catalog/tires/auto") ? pathname : "/catalog/tires/auto";
      router.push(`${autoPath}${buildQueryString(next, false, cityValue)}`);
    }
  }

  /** Сброс всех фильтров с учётом вкладки */
  const resetAll = () => {
    resetFilterParams();
    resetFilterAuto();
    resetAuto();
    router.push(tab === "car" ? `/catalog/tires/auto${buildQueryString({}, false, cityValue)}` : buildCatalogUrl({}, cityValue));
  };

  const num = (v: string) => (v && v !== "0" ? parseInt(v, 10) : undefined);
  const str = (v: string) => (v && v !== "0" ? v : undefined);

  return (
    <>
      {/* Верхняя панель: «Фильтры» / «По умолчанию» (мобильный) */}
      <div className="catalog-panel">
        <a
          className="catalog-panel-filters"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          <svg className="1st" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M10 1.36364C10 1.48419 9.95211 1.59981 9.86687 1.68505C9.78162 1.77029 9.66601 1.81818 9.54545 1.81818H8.18182C8.06126 1.81818 7.94565 1.77029 7.86041 1.68505C7.77516 1.59981 7.72727 1.48419 7.72727 1.36364C7.72727 1.24309 7.77516 1.12747 7.86041 1.04223C7.94565 0.956983 8.06126 0.909093 8.18182 0.909093H9.54545C9.66601 0.909093 9.78162 0.956983 9.86687 1.04223C9.95211 1.12747 10 1.24309 10 1.36364ZM0.454545 0.909093H4.17455C4.28177 0.605814 4.49276 0.350205 4.77022 0.187443C5.04768 0.0246807 5.37374 -0.0347549 5.69079 0.0196411C6.00783 0.0740371 6.29544 0.238762 6.50278 0.484703C6.71011 0.730643 6.82383 1.04196 6.82383 1.36364C6.82383 1.68531 6.71011 1.99663 6.50278 2.24257C6.29544 2.48851 6.00783 2.65324 5.69079 2.70764C5.37374 2.76203 5.04768 2.7026 4.77022 2.53983C4.49276 2.37707 4.28177 2.12146 4.17455 1.81818H0.454545C0.333993 1.81818 0.218377 1.77029 0.133133 1.68505C0.0478895 1.59981 0 1.48419 0 1.36364C0 1.24309 0.0478895 1.12747 0.133133 1.04223C0.218377 0.956983 0.333993 0.909093 0.454545 0.909093ZM5 1.36364C5 1.45354 5.02666 1.54142 5.0766 1.61617C5.12655 1.69092 5.19754 1.74918 5.2806 1.78358C5.36366 1.81799 5.45505 1.82699 5.54322 1.80945C5.6314 1.79191 5.71239 1.74862 5.77596 1.68505C5.83953 1.62148 5.88282 1.54049 5.90036 1.45232C5.9179 1.36414 5.90889 1.27275 5.87449 1.18969C5.84009 1.10663 5.78183 1.03564 5.70708 0.985698C5.63233 0.935752 5.54445 0.909093 5.45455 0.909093C5.33399 0.909093 5.21838 0.956983 5.13313 1.04223C5.04789 1.12747 5 1.24309 5 1.36364ZM0 5C0 4.87945 0.0478895 4.76383 0.133133 4.67859C0.218377 4.59334 0.333993 4.54546 0.454545 4.54546H2.35636C2.46359 4.24218 2.67458 3.98657 2.95204 3.82381C3.2295 3.66104 3.55556 3.60161 3.87261 3.656C4.18965 3.7104 4.47726 3.87512 4.68459 4.12106C4.89193 4.367 5.00565 4.67832 5.00565 5C5.00565 5.32168 4.89193 5.633 4.68459 5.87894C4.47726 6.12488 4.18965 6.2896 3.87261 6.344C3.55556 6.39839 3.2295 6.33896 2.95204 6.1762C2.67458 6.01343 2.46359 5.75782 2.35636 5.45455H0.454545C0.333993 5.45455 0.218377 5.40666 0.133133 5.32141C0.0478895 5.23617 0 5.12055 0 5ZM3.18182 5C3.18182 5.0899 3.20848 5.17778 3.25842 5.25253C3.30837 5.32728 3.37936 5.38554 3.46242 5.41995C3.54547 5.45435 3.63687 5.46335 3.72504 5.44581C3.81321 5.42827 3.89421 5.38498 3.95778 5.32141C4.02135 5.25784 4.06464 5.17685 4.08218 5.08868C4.09971 5.0005 4.09071 4.90911 4.05631 4.82605C4.02191 4.743 3.96365 4.67201 3.8889 4.62206C3.81415 4.57211 3.72626 4.54546 3.63636 4.54546C3.51581 4.54546 3.4002 4.59334 3.31495 4.67859C3.22971 4.76383 3.18182 4.87945 3.18182 5ZM9.54545 4.54546H6.36364C6.24308 4.54546 6.12747 4.59334 6.04222 4.67859C5.95698 4.76383 5.90909 4.87945 5.90909 5C5.90909 5.12055 5.95698 5.23617 6.04222 5.32141C6.12747 5.40666 6.24308 5.45455 6.36364 5.45455H9.54545C9.66601 5.45455 9.78162 5.40666 9.86687 5.32141C9.95211 5.23617 10 5.12055 10 5C10 4.87945 9.95211 4.76383 9.86687 4.67859C9.78162 4.59334 9.66601 4.54546 9.54545 4.54546ZM9.54545 8.18182H7.27273C7.15217 8.18182 7.03656 8.22971 6.95131 8.31495C6.86607 8.40019 6.81818 8.51581 6.81818 8.63636C6.81818 8.75692 6.86607 8.87253 6.95131 8.95777C7.03656 9.04302 7.15217 9.09091 7.27273 9.09091H9.54545C9.66601 9.09091 9.78162 9.04302 9.86687 8.95777C9.95211 8.87253 10 8.75692 10 8.63636C10 8.51581 9.95211 8.40019 9.86687 8.31495C9.78162 8.22971 9.66601 8.18182 9.54545 8.18182ZM0 8.63636C0 8.51581 0.0478895 8.40019 0.133133 8.31495C0.218377 8.22971 0.333993 8.18182 0.454545 8.18182H3.26545C3.37268 7.87854 3.58367 7.62293 3.86113 7.46017C4.13859 7.2974 4.46465 7.23797 4.7817 7.29237C5.09874 7.34676 5.38635 7.51149 5.59368 7.75743C5.80102 8.00337 5.91474 8.31469 5.91474 8.63636C5.91474 8.95804 5.80102 9.26936 5.59368 9.5153C5.38635 9.76124 5.09874 9.92596 4.7817 9.98036C4.46465 10.0348 4.13859 9.97532 3.86113 9.81256C3.58367 9.6498 3.37268 9.39419 3.26545 9.09091H0.454545C0.333993 9.09091 0.218377 9.04302 0.133133 8.95777C0.0478895 8.87253 0 8.75692 0 8.63636ZM4.09091 8.63636C4.09091 8.72626 4.11757 8.81414 4.16751 8.88889C4.21746 8.96364 4.28845 9.0219 4.37151 9.05631C4.45457 9.09071 4.54596 9.09971 4.63413 9.08217C4.72231 9.06463 4.8033 9.02134 4.86687 8.95777C4.93044 8.89421 4.97373 8.81321 4.99127 8.72504C5.0088 8.63687 4.9998 8.54547 4.9654 8.46242C4.931 8.37936 4.87274 8.30837 4.79799 8.25842C4.72324 8.20848 4.63536 8.18182 4.54545 8.18182C4.4249 8.18182 4.30929 8.22971 4.22404 8.31495C4.1388 8.40019 4.09091 8.51581 4.09091 8.63636Z" fill="white" />
          </svg>
          Фильтры
        </a>
        <a href="#" className="catalog-panel-defaults">По умолчанию</a>
      </div>

      {/* Содержимое фильтра — 1-в-1 с шаблоном (по умолчанию скрыт, как index.html) */}
      <div className={`catalog-filter${open ? " catalog-filter-show" : ""}`} id="filter-in-catalog">
        <div className="catalog-filter-category">
          <div
            className={`filter-item-catalog${tab !== "params" ? " inactive" : ""}`}
            id="paramFilter"
            onClick={() => switchTab("params")}
          >
            По параметрам
          </div>
          <div
            className={`filter-item-catalog${tab !== "car" ? " inactive" : ""}`}
            id="carFilter"
            onClick={() => switchTab("car")}
          >
            По автомобилю
          </div>
        </div>

        <div className="catalog-filter-cont">
          {/* Город */}
          <a className="city-change city-change-catalog" href="#" onClick={(e) => { e.preventDefault(); setGeoOpen(); }}>
            <svg className="path-svg" xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
              <path d="M2.05034 1.91438C3.36309 0.688624 5.14355 0 7.00005 0C8.85655 0 10.637 0.688624 11.9498 1.91438C13.2625 3.14014 14 4.80263 14 6.53611C14 8.2696 13.2625 9.93208 11.9498 11.1578L10.9955 12.0391C10.2921 12.6832 9.37964 13.5119 8.25737 14.5252C7.92007 14.8298 7.46924 15 7.00005 15C6.53086 15 6.08003 14.8298 5.74273 14.5252L2.93626 11.976C2.58334 11.6525 2.2883 11.38 2.05034 11.1578C1.40031 10.5509 0.884667 9.83039 0.532868 9.03739C0.181069 8.24439 0 7.39445 0 6.53611C0 5.67777 0.181069 4.82783 0.532868 4.03483C0.884667 3.24183 1.40031 2.5213 2.05034 1.91438ZM11.0968 2.71007C10.0101 1.69554 8.53621 1.12566 6.99948 1.1258C5.46275 1.12594 3.98902 1.69609 2.90249 2.71082C1.81596 3.72555 1.20564 5.10174 1.2058 6.53664C1.20595 7.97155 1.81656 9.34762 2.9033 10.3622L4.09791 11.4641C4.92312 12.217 5.75062 12.9676 6.58041 13.716C6.69285 13.8176 6.84319 13.8744 6.99965 13.8744C7.15611 13.8744 7.30644 13.8176 7.41889 13.716L10.1474 11.2389C10.5252 10.8929 10.8412 10.6009 11.096 10.3622C12.1825 9.34761 12.7929 7.97161 12.7929 6.53686C12.7929 5.10211 12.1825 3.72612 11.096 2.71157L11.0968 2.71007ZM7.00005 4.48985C7.31698 4.48985 7.6308 4.54814 7.9236 4.66138C8.2164 4.77463 8.48245 4.94062 8.70655 5.14987C8.93065 5.35912 9.10842 5.60754 9.2297 5.88094C9.35098 6.15434 9.41341 6.44736 9.41341 6.74329C9.41341 7.03922 9.35098 7.33224 9.2297 7.60564C9.10842 7.87904 8.93065 8.12746 8.70655 8.33671C8.48245 8.54596 8.2164 8.71195 7.9236 8.8252C7.6308 8.93844 7.31698 8.99673 7.00005 8.99673C6.36772 8.98595 5.76519 8.74384 5.32209 8.32248C4.879 7.90112 4.63074 7.33419 4.63074 6.74367C4.63074 6.15314 4.879 5.58621 5.32209 5.16485C5.76519 4.74349 6.36772 4.50063 7.00005 4.48985Z" fill="#DD062A" />
            </svg>
            {cityLabel}
            <svg className="arr-svg" xmlns="http://www.w3.org/2000/svg" width="6" height="9" viewBox="0 0 6 9" fill="none">
              <path d="M1 1L5 4.5L1 8" stroke="black" strokeLinecap="round" />
            </svg>
          </a>

          {/* Вкладка «По параметрам»: колонка с параметрами шин */}
          {tab === "params" && (
            <div className="calatog-select-col">
              <CatSelect id="catalog-widthSelect" value={effective.width ? String(effective.width) : "0"} onChange={(v) => apply({ width: num(v) })} placeholder="Ширина">
                {options.widths.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </CatSelect>
              <CatSelect id="catalog-profileSelect" value={effective.profile ? String(effective.profile) : "0"} onChange={(v) => apply({ profile: num(v) })} placeholder="Профиль">
                {options.profiles.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </CatSelect>
              <CatSelect id="catalog-diameterSelect" value={effective.diameter ? String(effective.diameter) : "0"} onChange={(v) => apply({ diameter: num(v) })} placeholder="Диаметр">
                {options.diameters.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </CatSelect>
              <CatSelect id="catalog-seasonalitySelect" value={effective.season ?? "0"} onChange={(v) => apply({ season: str(v) })} placeholder="Сезонность">
                {options.seasons.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </CatSelect>
              <CatSelect id="catalog-tireTypeSelect" value={effective.tireType ?? "0"} onChange={(v) => apply({ tireType: str(v) })} placeholder="Тип шин">
                {options.tireTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </CatSelect>
              <CatSelect id="catalog-manufacturerSelect" value={effective.brand ?? "0"} onChange={(v) => apply({ brand: str(v) })} placeholder="Производитель">
                {options.brands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </CatSelect>
            </div>
          )}

          {/* Вкладка «По автомобилю»: селекты отражают текущий выбор каскада,
              выбор значения → переход на следующий уровень каскада */}
          {tab === "car" && (
            <div className="calatog-select-col">
              <CatSelect
                id="manufacturerSelect"
                value={autoData?.brand ?? "0"}
                onChange={(v) => goAuto(`/catalog/tires/auto/${v}`, v)}
                placeholder="Производитель"
              >
                {autoBrands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </CatSelect>
              <CatSelect
                id="modelSelect"
                value={autoData?.model ?? "0"}
                onChange={(v) => goAuto(`/catalog/tires/auto/${autoData?.brand}/${v}`, v)}
                placeholder="Модель"
              >
                {autoData?.models?.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
              </CatSelect>
              <CatSelect
                id="yearSelect"
                value={autoData?.year ?? "0"}
                onChange={(v) => goAuto(`/catalog/tires/auto/${autoData?.brand}/${autoData?.model}/${v}`, v)}
                placeholder="Год выпуска"
              >
                {autoData?.years?.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </CatSelect>
              <CatSelect
                id="modificationSelect"
                value={autoData?.mod ?? "0"}
                onChange={(v) => goAuto(`/catalog/tires/auto/${autoData?.brand}/${autoData?.model}/${autoData?.year}/${v}`, v)}
                placeholder="Модификация"
              >
                {autoData?.modifications?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </CatSelect>
            </div>
          )}

          {/* Цена */}
          <div className="filter-price">
            <label htmlFor="priceRange">Цена:</label>
            <div className="input-filters">
              <div className="price-inputs">
                <span>От:</span>
                <input
                  type="text"
                  id="priceMin"
                  placeholder={String(options.priceMin)}
                  value={effective.priceMin ?? ""}
                  onChange={(e) => apply({ priceMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
              <div className="price-inputs">
                <span>До:</span>
                <input
                  type="text"
                  id="priceMax"
                  placeholder={String(options.priceMax)}
                  value={effective.priceMax ?? ""}
                  onChange={(e) => apply({ priceMax: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
            <PriceSlider
              min={options.priceMin}
              max={options.priceMax}
              valueMin={effective.priceMin}
              valueMax={effective.priceMax}
              onChange={(min, max) => apply({ priceMin: min, priceMax: max })}
            />
          </div>

          {/* Чекбоксы доставки */}
          <div className="delivery-checkbox-group">
            <h3 className="delivery-title-cat">Способ получения</h3>
            <div className="options-group">
              {options.delivery.map((opt) => {
                const checked = effective.delivery?.includes(opt.value) ?? false;
                return (
                  <div className="option" key={opt.value}>
                    <input
                      type="checkbox"
                      id={`delivery-${opt.value}`}
                      checked={checked}
                      onChange={(e) => {
                        const next = effective.delivery ? [...effective.delivery] : [];
                        if (e.target.checked) {
                          next.push(opt.value);
                        } else {
                          const idx = next.indexOf(opt.value);
                          if (idx >= 0) next.splice(idx, 1);
                        }
                        apply({ delivery: next.length > 0 ? next : undefined });
                      }}
                    />
                    <label htmlFor={`delivery-${opt.value}`}>{opt.label}</label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Страна бренда */}
          <div className="country-selet-2">
            <h3 className="delivery-title-cat country-title-cat">Страна бренда</h3>
            <CatSelect id="catalog-countrySelect" value={effective.country ?? "0"} onChange={(v) => apply({ country: str(v) })} placeholder="Производитель">
              {options.countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </CatSelect>
          </div>

          <a
            href="#"
            className="remove-filters help"
            onClick={(e) => {
              e.preventDefault();
              resetAll();
            }}
          >
            Сбросить все фильтры
          </a>
        </div>
      </div>
    </>
  );
}
