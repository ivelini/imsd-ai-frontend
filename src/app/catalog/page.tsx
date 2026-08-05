// Каталог — стартовая страница (05.08.2026): 4 карточки + бренды
// Из .template/catalog/start.html
import { getCatalogStart } from "@/shared/api/data";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { CatalogStart } from "@/features/catalog/components/CatalogStart";

export default async function Page() {
  const data = await getCatalogStart();

  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Каталог" }]}
      />
      <CatalogStart data={data} />
    </>
  );
}
