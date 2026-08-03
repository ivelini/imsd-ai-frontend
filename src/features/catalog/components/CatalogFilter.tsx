// Панель фильтров каталога: .catalog-panel + .catalog-filter (фаза 2)
// Строго 1-в-1 с DOM-структурой шаблона
"use client";

import { useRouter } from "next/navigation";
import type { FilterOptions, FilterState, BrandOption } from "@/features/catalog/types";
import { buildCatalogUrl } from "@/shared/lib/parseParams";

interface CatalogFilterProps {
  options: FilterOptions;
  current: FilterState;
}

export function CatalogFilter({ options, current }: CatalogFilterProps) {
  const router = useRouter();

  function apply(overrides: Partial<FilterState>) {
    const next = { ...current, ...overrides };
    router.push(buildCatalogUrl(next));
  }

  return (
    <>
      {/* Верхняя панель: «Фильтры» / «По умолчанию» */}
      <div className="catalog-panel">
        <a className="catalog-panel-filters" href="#">
          Фильтры
        </a>
        <a href="/catalog/tires" className="catalog-panel-defaults">По умолчанию</a>
      </div>

      {/* Содержимое фильтра */}
      <div className="catalog-filter catalog-filter-show" id="filter-in-catalog">
        {/* Табы */}
        <div className="catalog-filter-category">
          <div className="filter-item-catalog" id="paramFilter">По параметрам</div>
          <a href="/catalog/tires/auto" className="filter-item-catalog inactive" id="carFilter">По автомобилю</a>
        </div>

        <div className="catalog-filter-cont">
          {/* Город */}
          <a className="city-change city-change-catalog" href="#">
            Челябинск
          </a>

          {/* Селекты — колонка 1 */}
          <div className="calatog-select-col">
            <select
              id="catalog-widthSelect"
              className="custom-select-cat"
              value={current.width ?? ""}
              onChange={(e) => apply({ width: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">Ширина</option>
              {options.widths.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <select
              id="catalog-profileSelect"
              className="custom-select-cat"
              value={current.profile ?? ""}
              onChange={(e) => apply({ profile: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">Профиль</option>
              {options.profiles.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              id="catalog-diameterSelect"
              className="custom-select-cat"
              value={current.diameter ?? ""}
              onChange={(e) => apply({ diameter: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">Диаметр</option>
              {options.diameters.map((d) => (
                <option key={d} value={d}>R{d}</option>
              ))}
            </select>

            <select
              id="catalog-seasonalitySelect"
              className="custom-select-cat"
              value={current.season ?? ""}
              onChange={(e) => apply({ season: e.target.value || undefined })}
            >
              <option value="">Сезонность</option>
              {options.seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Селекты — колонка 2 */}
          <div className="calatog-select-col">
            <select
              id="catalog-manufacturerSelect"
              className="custom-select-cat"
              value={current.brand ?? ""}
              onChange={(e) => apply({ brand: e.target.value || undefined })}
            >
              <option value="">Производитель</option>
              {options.brands.map((b: BrandOption) => (
                <option key={b.id} value={b.id}>{b.name} ({b.count})</option>
              ))}
            </select>

            <select
              id="catalog-manufacturerSelect2"
              className="custom-select-cat"
              value={current.country ?? ""}
              onChange={(e) => apply({ country: e.target.value || undefined })}
            >
              <option value="">Страна бренда</option>
              {options.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Цена */}
          <div className="filter-price">
            <input
              type="number"
              id="priceMin"
              placeholder={String(options.priceMin)}
              value={current.priceMin ?? ""}
              onChange={(e) => apply({ priceMin: e.target.value ? parseInt(e.target.value) : undefined })}
            />
            <span>&mdash;</span>
            <input
              type="number"
              id="priceMax"
              placeholder={String(options.priceMax)}
              value={current.priceMax ?? ""}
              onChange={(e) => apply({ priceMax: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          {/* Чекбоксы доставки */}
          <div className="delivery-checkbox-group">
            {["Сегодня", "Поставка 1-2 дня", "Поставка 2-5 дней", "Поставка 5-7 дней"].map((label, i) => (
              <label className="option" key={i}>
                <input
                  type="checkbox"
                  checked={current.delivery?.includes(label) ?? false}
                  onChange={(e) => {
                    const next = current.delivery ? [...current.delivery] : [];
                    if (e.target.checked) {
                      next.push(label);
                    } else {
                      const idx = next.indexOf(label);
                      if (idx >= 0) next.splice(idx, 1);
                    }
                    apply({ delivery: next.length > 0 ? next : undefined });
                  }}
                />
                <span />
                <p>{label}</p>
              </label>
            ))}
          </div>

          <button className="get-result">Подобрать</button>
          <a href="/catalog/tires" className="remove-filters help">Сбросить все фильтры</a>
        </div>
      </div>
    </>
  );
}
