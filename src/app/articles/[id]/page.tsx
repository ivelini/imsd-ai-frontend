import { Placeholder } from "@/components/Placeholder";

export default function Page() {
  return <Placeholder title="Статья" crumbs={[{ label: "Главная", href: "/" }, { label: "Статьи", href: "/articles" }, { label: "Статья" }]} />;
}
