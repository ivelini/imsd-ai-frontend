import type { Metadata } from "next";
import "./style.css";
import { getNav } from "@/shared/api/data";
import { ClientLayout } from "@/shared/layout/ClientLayout";
import { AddToCartPopup } from "@/shared/layout/AddToCartPopup";
import { Benefits } from "@/shared/layout/Benefits";
import { CatalogMenu } from "@/shared/layout/CatalogMenu";
import { Footer } from "@/shared/layout/Footer";
import { GeoPopup } from "@/shared/layout/GeoPopup";
import { CityHydrator } from "@/shared/layout/client-islands/CityHydrator";
import { Header } from "@/shared/layout/Header";

export const metadata: Metadata = {
  title: "Альянс — шины и диски",
  description: "Интернет-магазин шин и дисков",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nav = await getNav();

  return (
    <html lang="ru">
      <body>
        <ClientLayout>
          <CityHydrator />
          <div className="app">
            <div className="wrapper">
              <CatalogMenu nav={nav} />
              <GeoPopup />
              <Header nav={nav} />
              <Benefits benefits={nav.benefits} />
              {children}
              <Footer nav={nav} />
              <AddToCartPopup />
            </div>
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}
