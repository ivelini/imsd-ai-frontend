// Заглушка разделов (роуты-заглушки фаз 1–2)
export function Placeholder({ name }: { name: string }) {
  return (
    <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
      <h2>{name}</h2>
      <p style={{ color: "var(--color-gray)" }}>Раздел в разработке</p>
    </div>
  );
}
