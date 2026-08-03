// Главная: серверная с клиентскими островами (03.08.2026)
// Данные через await getXxx() → props каруселям и секциям
import { getHomeProducts, getNews, getAboutText } from "@/shared/api/data";
import { MainFilter } from "@/features/home/components/MainFilter";
import { DiscountBlock } from "@/features/home/components/DiscountBlock";
import { ThreeBlocks } from "@/features/home/components/ThreeBlocks";
import { HomeProductLists } from "@/features/home/components/ProductList";
import { NewsSection } from "@/features/home/components/NewsSection";
import { AboutCompany } from "@/features/home/components/AboutCompany";

export default async function Home() {
  const [wheels, disks, news, aboutText] = await Promise.all([
    getHomeProducts("wheels"),
    getHomeProducts("disks"),
    getNews(),
    getAboutText(),
  ]);

  return (
    <>
      <div className="inner-wrapper">
        <div className="container main-block">
          <MainFilter />
          <DiscountBlock />
        </div>
      </div>
      <ThreeBlocks />
      <HomeProductLists wheels={wheels} disks={disks} />
      <NewsSection news={news} />
      <AboutCompany text={aboutText} />
    </>
  );
}
