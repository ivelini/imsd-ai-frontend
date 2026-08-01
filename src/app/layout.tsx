import type { Metadata } from "next";
import "./style.css";
import { AddToCartPopup } from "@/shared/layout/AddToCartPopup";
import { Benefits } from "@/shared/layout/Benefits";
import { CatalogMenu } from "@/shared/layout/CatalogMenu";
import { Footer } from "@/shared/layout/Footer";
import { GeoPopup } from "@/shared/layout/GeoPopup";
import { Header } from "@/shared/layout/Header";

export const metadata: Metadata = {
  title: "Альянс — шины и диски",
  description: "Интернет-магазин шин и дисков",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <div className="app">
          <div className="wrapper">
            <CatalogMenu />
            <GeoPopup />
            <Header />
            <Benefits />
            {children}
            <Footer />
            <AddToCartPopup />
          </div>
        </div>
      </body>
    </html>
  );
}
