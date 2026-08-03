// Блок описания модели .model-description (фаза 2)
interface ModelDescriptionProps {
  name: string;
  brandName: string;
  image: string;
  params: { name: string; value: string }[];
  description: string;
}

export function ModelDescription({ name, brandName, image, params, description }: ModelDescriptionProps) {
  return (
    <div className="model-description">
      <div className="model-info">
        <img className="model-description-image" src={image} alt={name} />
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
      <div className="model-description-text">
        <p>{description}</p>
      </div>
    </div>
  );
}
