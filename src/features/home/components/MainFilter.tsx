// Главный фильтр «Шины/Диски»: клиентский, сабмит → каталог (фаза 2)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { buildCatalogUrl } from "@/shared/lib/parseParams";
import type { FilterState } from "@/features/catalog/types";
import { ArrowDownGrayIcon, ArrowRightBlackIcon } from "@/shared/layout/icons";
import { HelpIcon, PinFilterIcon } from "./main-filter-icons";
import { DiskIcon, WheelIcon } from "./wheel-disk-icons";

// value — латинские slug, совпадают с URL каталога (контракт api-contract.md)
const SEASON_OPTIONS = [
  ["", "Сезонность"],
  ["summer", "Летняя"],
  ["winter", "Зимняя"],
  ["all-season", "Всесезонная"],
];

const TYPE_OPTIONS = [
  ["", "Тип шин"],
  ["passenger", "Легковая"],
  ["suv", "Внедорожная"],
  ["commercial", "Коммерческая"],
];

const WIDTHS = Array.from({ length: 21 }, (_, i) => String(145 + i * 10));
const PROFILES = ["30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80"];
const DIAMETERS = Array.from({ length: 12 }, (_, i) => String(13 + i));

function Select({ value, onChange, options, label }: {
  value: string;
  onChange: (v: string) => void;
  options: string[][];
  label: string;
}) {
  return (
    <div className="custom-select-wrapper">
      <select className="custom-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([val, display]) => (
          <option key={val} value={val}>{display}</option>
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
  const city = useUIStore((s) => s.city);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);
  const [category, setCategory] = useState<"wheels" | "disks">("wheels");
  const [width, setWidth] = useState("");
  const [profile, setProfile] = useState("");
  const [diameter, setDiameter] = useState("");
  const [season, setSeason] = useState("");
  const [tireType, setTireType] = useState("");

  const handleSubmit = () => {
    const filter: FilterState = {};
    if (width) filter.width = parseInt(width);
    if (profile) filter.profile = parseInt(profile);
    if (diameter) filter.diameter = parseInt(diameter);
    if (season) filter.season = season;
    if (tireType) filter.tireType = tireType;

    if (category === "disks") {
      router.push("/catalog/wheels");
    } else {
      router.push(buildCatalogUrl(filter));
    }
  };

  return (
    <section className="filter-block">
      <input type="radio" name="catalog-category" id="cat-wheels" checked={category === "wheels"} onChange={() => setCategory("wheels")} hidden />
      <input type="radio" name="catalog-category" id="cat-disk" checked={category === "disks"} onChange={() => setCategory("disks")} hidden />
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
          <div className="switcher-wrap">
            <p className="filter-switcher-option">По параметрам</p>
            <div className="switcher">
              <div className="switcher-circle"></div>
            </div>
            <a href="/catalog/tires/auto" className="filter-switcher-option filter-switcher-option_disabled">По автомобилю</a>
          </div>
          <a href="#" className="choice-city" onClick={(e) => { e.preventDefault(); setGeoOpen(true); }}>
            <PinFilterIcon />
            {city}
            <ArrowRightBlackIcon />
          </a>
        </div>
        <div className="filter-content-item disk">
          <div className="select-row">
            <Select value={width} onChange={setWidth} label="Ширина" options={[["", "Ширина"], ...WIDTHS.map(w => [w, w])]} />
            <Select value={profile} onChange={setProfile} label="Профиль" options={[["", "Профиль"], ...PROFILES.map(p => [p, p])]} />
            <Select value={diameter} onChange={setDiameter} label="Диаметр" options={[["", "Диаметр"], ...DIAMETERS.map(d => [d, `R${d}`])]} />
          </div>
          <div className="select-row">
            <Select value={season} onChange={setSeason} label="Сезонность" options={SEASON_OPTIONS} />
            <Select value={tireType} onChange={setTireType} label="Тип шин" options={TYPE_OPTIONS} />
          </div>
        </div>
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
