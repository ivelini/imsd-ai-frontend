// Главный фильтр «Шины/Диски»: клиентский, сабмит → каталог (фаза 2, обновлено 05.08.2026)
// По макету index.html: .filter-content-item disk (6 селектов, включая
// «Производитель») и .filter-content-item wheel (диски: PCD/ET/ступица/тип).
// Опции — из мока-«бэка» (getFilterOptions/getWheelsFilters), не хардкод.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "@/shared/layout/api/useCity";
import { buildCatalogUrl, buildWheelsUrl } from "@/shared/lib/parseParams";
import { useFilterOptions, useWheelsFilterOptions } from "@/features/catalog/api/useFilterOptions";
import { useAutoBrands } from "@/features/catalog/api/useAutoBrands";
import { useAutoModels, useAutoYears, useAutoModifications } from "@/features/catalog/api/useAutoCascade";
import type { FilterOption, FilterState } from "@/features/catalog/types";
import { ArrowDownGrayIcon, ArrowRightBlackIcon } from "@/shared/layout/icons";
import { HelpIcon, PinFilterIcon } from "./main-filter-icons";
import { DiskIcon, WheelIcon } from "./wheel-disk-icons";

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  placeholder: string;
}) {
  return (
    <div className="custom-select-wrapper">
      <select className="custom-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="select-arrow">
        <ArrowDownGrayIcon />
      </div>
    </div>
  );
}

export function MainFilter() {
  const router = useRouter();
  const { cityLabel, cityValue, setGeoOpen } = useCity();
  const [category, setCategory] = useState<"wheels" | "disks">("wheels");
  /** «По параметрам» / «По автомобилю» (switcher в .filter-menu) */
  const [mode, setMode] = useState<"params" | "auto">("params");
  // Каскад «По автомобилю»
  const [autoBrand, setAutoBrand] = useState("");
  const [autoModel, setAutoModel] = useState("");
  const [autoYear, setAutoYear] = useState("");
  const [autoMod, setAutoMod] = useState("");

  // Шины
  const [width, setWidth] = useState("");
  const [profile, setProfile] = useState("");
  const [diameter, setDiameter] = useState("");
  const [season, setSeason] = useState("");
  const [studded, setStudded] = useState("");
  const [brand, setBrand] = useState("");
  // Диски
  const [pcd, setPcd] = useState("");
  const [et, setEt] = useState("");
  const [hubBore, setHubBore] = useState("");
  const [wheelType, setWheelType] = useState("");

  const { data: tireOptions } = useFilterOptions();
  const { data: wheelOptions } = useWheelsFilterOptions();
  // Каскад авто — по активной вкладке Шины/Диски
  const autoCategory: "tires" | "wheels" = category === "disks" ? "wheels" : "tires";
  const { data: autoBrands } = useAutoBrands(autoCategory);
  const { data: autoModels } = useAutoModels(autoBrand, mode === "auto", autoCategory);
  const { data: autoYears } = useAutoYears(autoBrand, autoModel, mode === "auto", autoCategory);
  const { data: autoMods } = useAutoModifications(
    autoBrand,
    autoModel,
    autoYear,
    mode === "auto",
    autoCategory,
  );

  // Чисто клиентский компонент: опции грузит сам (React Query)
  if (!tireOptions || !wheelOptions) return null;

  /** Смена вкладки Шины/Диски: каскад авто сбрасывается (марки разные) */
  const switchCategory = (next: "wheels" | "disks") => {
    setCategory(next);
    setAutoBrand("");
    setAutoModel("");
    setAutoYear("");
    setAutoMod("");
  };

  const handleSubmit = () => {
    if (mode === "auto") {
      const base = category === "disks" ? "/catalog/wheels/auto" : "/catalog/tires/auto";
      const path = [base, autoBrand, autoModel, autoYear, autoMod]
        .filter(Boolean)
        .join("/");
      router.push(path);
      return;
    }

    if (category === "disks") {
      const filter: FilterState = {};
      if (width) filter.width = Number(width);
      if (diameter) filter.diameter = Number(diameter);
      if (pcd) filter.pcd = pcd;
      if (et) filter.et = Number(et);
      if (hubBore) filter.hubBore = Number(hubBore);
      if (wheelType) filter.wheelType = wheelType;
      router.push(buildWheelsUrl(filter, cityValue));
      return;
    }

    const filter: FilterState = {};
    if (width) filter.width = Number(width);
    if (profile) filter.profile = Number(profile);
    // diameter — r-значение ("r15", "r13c"): Number("r15") дал бы NaN
    const diamMatch = diameter.match(/^r?(\d+)(c?)$/i);
    if (diamMatch) filter.diameter = diamMatch[2] ? `${diamMatch[1]}c` : Number(diamMatch[1]);
    if (season) filter.season = season as FilterState["season"];
    if (studded) filter.studded = studded as FilterState["studded"];
    if (brand) filter.brand = brand;
    router.push(buildCatalogUrl(filter, cityValue));
  };

  return (
    <section className="filter-block">
      <input type="radio" name="catalog-category" id="cat-wheels" checked={category === "wheels"} onChange={() => switchCategory("wheels")} hidden />
      <input type="radio" name="catalog-category" id="cat-disk" checked={category === "disks"} onChange={() => switchCategory("disks")} hidden />
      <div className="container filter-block-menu">
        <label className={`filter-item for-wheels${category === "disks" ? " inactive" : ""}`} htmlFor="cat-wheels">
          <WheelIcon />
          <p>Шины</p>
        </label>
        <label className={`filter-item for-disk${category === "wheels" ? " inactive" : ""}`} htmlFor="cat-disk">
          <DiskIcon />
          <p>Диски</p>
        </label>
      </div>
      <div className="filter-content">
        <div className="filter-menu">
          <div
            className={`switcher-wrap${mode === "auto" ? " switcher-wrap--auto" : ""}`}
            onClick={() => setMode(mode === "params" ? "auto" : "params")}
          >
            <p className="filter-switcher-option">По параметрам</p>
            <div className="switcher">
              <div className="switcher-circle"></div>
            </div>
            <p className={`filter-switcher-option${mode === "params" ? " filter-switcher-option_disabled" : ""}`}>
              По автомобилю
            </p>
          </div>
          <a href="#" className="choice-city" onClick={(e) => { e.preventDefault(); setGeoOpen(); }}>
            <PinFilterIcon />
            {cityLabel}
            <ArrowRightBlackIcon />
          </a>
        </div>

        {mode === "auto" ? (
          <div className="filter-content-item auto">
            <div className="select-row">
              <Select value={autoBrand} onChange={(v) => { setAutoBrand(v); setAutoModel(""); setAutoYear(""); setAutoMod(""); }} placeholder="Производитель" options={(autoBrands ?? []).map((b) => ({ label: b.name, value: b.id }))} />
              <Select value={autoModel} onChange={(v) => { setAutoModel(v); setAutoYear(""); setAutoMod(""); }} placeholder="Модель" options={(autoModels ?? []).map((m) => ({ label: m.name, value: m.slug }))} />
            </div>
            <div className="select-row">
              <Select value={autoYear} onChange={(v) => { setAutoYear(v); setAutoMod(""); }} placeholder="Год выпуска" options={(autoYears ?? []).map((y) => ({ label: String(y), value: String(y) }))} />
              <Select value={autoMod} onChange={setAutoMod} placeholder="Модификация" options={(autoMods ?? []).map((m) => ({ label: m.name, value: m.id }))} />
            </div>
          </div>
        ) : category === "wheels" ? (
          <div className="filter-content-item disk">
            <div className="select-row">
              <Select value={width} onChange={setWidth} placeholder="Ширина" options={tireOptions.widths} />
              <Select value={profile} onChange={setProfile} placeholder="Профиль" options={tireOptions.profiles} />
              <Select value={diameter} onChange={setDiameter} placeholder="Диаметр" options={tireOptions.diameters} />
            </div>
            <div className="select-row">
              <Select value={season} onChange={setSeason} placeholder="Сезонность" options={tireOptions.seasons} />
              <Select value={studded} onChange={setStudded} placeholder="Шипованность" options={tireOptions.studded} />
              <Select value={brand} onChange={setBrand} placeholder="Производитель" options={tireOptions.brands} />
            </div>
          </div>
        ) : (
          <div className="filter-content-item wheel">
            <div className="select-row">
              <Select value={width} onChange={setWidth} placeholder="Ширина" options={wheelOptions.widths} />
              <Select value={diameter} onChange={setDiameter} placeholder="Диаметр" options={wheelOptions.diameters} />
              <Select value={pcd} onChange={setPcd} placeholder="Крепеж (PCD)" options={wheelOptions.pcds} />
            </div>
            <div className="select-row">
              <Select value={et} onChange={setEt} placeholder="Вылет (ET)" options={wheelOptions.ets} />
              <Select value={hubBore} onChange={setHubBore} placeholder="Ступица" options={wheelOptions.hubBores} />
              <Select value={wheelType} onChange={setWheelType} placeholder="Тип диска" options={wheelOptions.wheelTypes} />
            </div>
          </div>
        )}

        <button className="submit-filter-button secondary-btn" onClick={handleSubmit}>
          Подобрать
        </button>
        <div className="help-block">
          <HelpIcon />
          <a href="#" className="help-process help">Помощь в подборе</a>
        </div>
      </div>
    </section>
  );
}
