import type { Metadata } from "next";
import "./globals.css";
import "./style.css";
import { CatalogMenu } from "@/components/layout/CatalogMenu";
import { GeoPopup } from "@/components/layout/GeoPopup";
import { Header } from "@/components/layout/Header";
import { Benefits } from "@/components/layout/Benefits";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Автоальянс — шины и диски",
  description: "Интернет-магазин шин и дисков в Челябинске",
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
          </div>
        </div>
      </body>
    </html>
  );
}
