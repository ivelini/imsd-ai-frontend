// Блок описания модели .model-description (фаза 2; 16.10.2026 — описание от бэка:
// rich-текст HTML, пустое — блок скрыт)
interface ModelDescriptionProps {
  name: string;
  brandName: string;
  image: string;
  params: { name: string; value: string }[];
  description: string | null;
}

export function ModelDescription({ name, brandName, image, params, description }: ModelDescriptionProps) {
  return (
    <div className="model-description">
      <div className="model-info">
        {/* Разметка макета: класс-обёртка на div, размер задаёт правило `.model-description-image img` */}
        <div className="model-description-image">
          <img src={image} alt={name} />
        </div>
        <div className="model-description-params">
          {params.map((p) => (
            <div className="model-param" key={p.name}>
              <span className="model-param-name">{p.name}</span>
              <span className="parameter-dots" />
              <span className="model-param-value">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
      {description && (
        <div
          className="model-description-text"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
