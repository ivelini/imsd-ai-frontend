// Главная: серверная с клиентскими островами (03.08.2026)
// Данные — GET /api/service-page/main (мок getHomeData): slider, news,
// description, seo. Заголовки секций и блоки скидок — статичны.
import type { Metadata } from "next";
import { getHomeData } from "@/shared/api/data";
import { MainFilter } from "@/features/home/components/MainFilter";
import { DiscountBlock } from "@/features/home/components/DiscountBlock";
import { ThreeBlocks } from "@/features/home/components/ThreeBlocks";
import { HomeProductLists } from "@/features/home/components/ProductList";
import { NewsSection } from "@/features/home/components/NewsSection";
import { AboutCompany } from "@/features/home/components/AboutCompany";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getHomeData();
  return { title: seo.title, description: seo.description };
}

export default async function Home() {
  const data = await getHomeData();

  return (
    <>
      <div className="inner-wrapper">
        <div className="container main-block">
          <MainFilter />
          <DiscountBlock />
        </div>
      </div>
      <ThreeBlocks />
      <HomeProductLists tires={data.slider.tires} wheels={data.slider.wheels} />
      <NewsSection news={data.news} />
      <AboutCompany text={data.description} />
    </>
  );
}
