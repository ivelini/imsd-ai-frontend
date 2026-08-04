// Блок выбранного авто: .car-block с чекбоксами размеров (фаза 2)
// Разметка 1-в-1 с .template/catalog/auto-selected.html
import type { CarBlockData } from "@/shared/api/data";

export function CarBlock({ data }: { data: CarBlockData }) {
  return (
    <div className="car-block">
      <div className="car-name">{data.name}</div>
      <div className="car-sections">
        {data.sections.map((section, si) => (
          <div className="car-section" key={si}>
            <div className="car-section-name">{section.name}</div>
            <div className="car-section-options">
              {section.options.map((opt, oi) => {
                const id = `size-${si}-${oi}`;
                return (
                  <div className="custom-checkbox" key={oi}>
                    <div className="custom-checkbox-container">
                      <input
                        type="checkbox"
                        id={id}
                        data-width={opt.width}
                        data-height={opt.height}
                        data-diameter={opt.diameter}
                      />
                      <label htmlFor={id}>{opt.label}</label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
