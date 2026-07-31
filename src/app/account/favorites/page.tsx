import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Избранное" crumbs={[{ label: "Главная", href: "/" }, { label: "Личный кабинет", href: "/account/profile" }, { label: "Избранное" }]} />;
}
