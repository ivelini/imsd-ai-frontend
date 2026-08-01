// Главная: .template/index.html (фаза 1)
import { MainFilter } from "@/features/home/components/MainFilter";
import { DiscountBlock } from "@/features/home/components/DiscountBlock";
import { ThreeBlocks } from "@/features/home/components/ThreeBlocks";
import { WheelsList, DisksList } from "@/features/home/components/ProductList";
import { NewsSection } from "@/features/home/components/NewsSection";
import { AboutCompany } from "@/features/home/components/AboutCompany";

export default function Home() {
  return (
    <>
      <div className="inner-wrapper">
        <div className="container main-block">
          <MainFilter />
          <DiscountBlock />
        </div>
      </div>
      <ThreeBlocks />
      <WheelsList />
      <DisksList />
      <NewsSection />
      <AboutCompany />
    </>
  );
}
