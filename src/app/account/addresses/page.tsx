import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Адреса" crumbs={[{ label: "Главная", href: "/" }, { label: "Личный кабинет", href: "/account/profile" }, { label: "Адреса" }]} />;
}
