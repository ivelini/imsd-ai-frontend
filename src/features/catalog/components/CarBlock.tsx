// Блок выбранного авто: .car-block с чекбоксами размеров (фаза 2)
// Клиентский: чекбоксы управляют видимостью секций каталога через onSelectionChange
"use client";

type CarBlockOption = { label: string; width: number; diameter: number; checked?: boolean; key: string; pcd?: string; et?: number; height?: number };
type CarBlockSection = { name: string; options: CarBlockOption[] };

type CarBlockProps = {
  data: { name: string; sections: CarBlockSection[] };
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
};

export function CarBlock({ data, selectedKeys, onToggle }: CarBlockProps) {
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
                        data-key={opt.key}
                        checked={selectedKeys.has(opt.key)}
                        onChange={() => onToggle(opt.key)}
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
