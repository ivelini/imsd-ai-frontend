import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";

// Заглушка для разделов, реализуемых в следующих фазах плана module-split.md
export function Placeholder({ title, crumbs }: { title: string; crumbs: Crumb[] }) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <section className="catalog-section container">
        <h2>{title}</h2>
        <p>Раздел в разработке.</p>
      </section>
    </>
  );
}
