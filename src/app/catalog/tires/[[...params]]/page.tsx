import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { CatalogFilter, type FilterInitial } from "@/components/catalog/CatalogFilter";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Pagination } from "@/components/catalog/Pagination";
import { SeoBlock } from "@/components/catalog/SeoBlock";
import { TIRE_MODELS } from "@/data/catalog";

export const dynamic = "force-static";

const SEASONS = new Set(["winter", "summer", "all-season"]);

interface ParsedSegments {
  season?: string;
  brand?: string;
  width?: string;
  profile?: string;
  diameter?: string;
}

function parseSegments(params?: string[]): ParsedSegments {
  const out: ParsedSegments = {};
  if (!params) return out;
  let numbers: string[] = [];
  for (const seg of params) {
    if (/^r\d+$/i.test(seg)) {
      out.diameter = seg.toUpperCase();
    } else if (/^\d+$/.test(seg)) {
      numbers.push(seg);
    } else if (!out.season && SEASONS.has(seg)) {
      out.season = seg;
    } else if (!out.brand) {
      out.brand = seg;
    }
  }
  if (numbers[0]) out.width = numbers[0];
  if (numbers[1]) out.profile = numbers[1];
  return out;
}

const SEASON_RU: Record<string, string> = { winter: "зимние", summer: "летние", "all-season": "всесезонные" };

export default async function TiresCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ params?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { params: segments } = await params;
  const sp = await searchParams;
  const seg = parseSegments(segments);

  const priceMin = Number(sp.price_min) || undefined;
  const priceMax = Number(sp.price_max) || undefined;
  const delivery = typeof sp.delivery === "string" ? sp.delivery.split(",") : [];
  const page = Number(sp.page) || 1;

  const hasFilters =
    Boolean(seg.season || seg.brand || seg.width || seg.profile || seg.diameter || priceMin || priceMax || delivery.length);

  const initial: FilterInitial = {
    open: hasFilters,
    activeTab: "params",
    width: seg.width,
    profile: seg.profile,
    diameter: seg.diameter,
    season: seg.season,
    manufacturer: seg.brand ? seg.brand[0].toUpperCase() + seg.brand.slice(1) : undefined,
    priceMin,
    priceMax,
    delivery,
  };

  let products = TIRE_MODELS.flatMap((m) => m.sizes);
  if (hasFilters) {
    products = products.filter((p) => {
      const [w, prof] = p.size.split("/");
      const [prof2, diam] = prof.split(" ");
      if (seg.width && w !== seg.width) return false;
      if (seg.profile && prof2 !== seg.profile) return false;
      if (seg.diameter && diam.toUpperCase() !== seg.diameter) return false;
      if (seg.season && SEASON_RU[seg.season] !== p.season) return false;
      if (seg.brand && p.brand.toLowerCase() !== seg.brand) return false;
      if (priceMin && p.price < priceMin) return false;
      if (priceMax && p.price > priceMax) return false;
      return true;
    });
  }

  const sizeTitle =
    seg.width && seg.profile && seg.diameter ? ` ${seg.width}/${seg.profile} ${seg.diameter}` : "";
  const title = `Шины${sizeTitle} на авто в Челябинске`;

  const crumbs: Crumb[] = [
    { label: "Главная", href: "/" },
    { label: "Каталог шин", href: "/catalog/tires" },
  ];
  if (seg.brand) crumbs.push({ label: seg.brand[0].toUpperCase() + seg.brand.slice(1) });
  if (sizeTitle) crumbs.push({ label: sizeTitle.trim() });

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <section className="catalog-section container">
        <h2>{title}</h2>
        <div className="main-content-catalog">
          <CatalogFilter initial={initial} />
          <div className="catalog-with-products">
            {products.length > 0 ? (
              products.map((p) => <ProductCard product={p} linkTitle key={p.id} />)
            ) : (
              <p style={{ color: "var(--color-gray)" }}>По заданным параметрам товаров не найдено.</p>
            )}
          </div>
          <Pagination page={page} total={Math.ceil(products.length / 12) || 1} basePath="/catalog/tires" />
        </div>
      </section>
      <SeoBlock />
    </>
  );
}
