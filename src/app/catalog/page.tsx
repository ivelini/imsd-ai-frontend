// Каталог — стартовая страница (05.08.2026; живые бренды из фасетов 23.10.2026):
// 4 карточки + бренды шин/дисков из фасетов фильтров. Город — контекст ссылок (ADR 0004).
import { getCatalogStart } from "@/shared/api/data";
import { appendCityParam } from "@/shared/lib/cityUrl";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { CatalogStart } from "@/features/catalog/components/CatalogStart";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const cityValue = typeof resolved.city === "string" ? resolved.city : undefined;
  const data = await getCatalogStart(cityValue);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { label: "Главная", href: appendCityParam("/", cityValue ?? "") },
          { label: "Каталог" },
        ]}
      />
      <CatalogStart data={data} />
    </>
  );
}
