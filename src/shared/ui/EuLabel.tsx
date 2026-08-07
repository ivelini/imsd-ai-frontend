// Европейская маркировка шины: сопротивление качению, сцепление, шум
export function EuLabel({
  rollingResistance,
  wetGrip,
  noiseEmission,
}: {
  rollingResistance: string;
  wetGrip: string;
  noiseEmission: number;
}) {
  return (
    <div className="eu-label">
      <i className={`rolling-resistance category-${rollingResistance}`}>{rollingResistance}</i>
      <i className={`wet-grip category-${wetGrip}`}>{wetGrip}</i>
      <i className="noise-emission">{noiseEmission}</i>
    </div>
  );
}
