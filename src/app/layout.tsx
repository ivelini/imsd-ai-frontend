import type { Metadata } from "next";
import "./style.css";

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
      <body>{children}</body>
    </html>
  );
}
