// Секция «О компании» (фаза 1)
import { ABOUT_TEXT } from "@/data/products";

export function AboutCompany() {
  return (
    <section className="about-company-section container">
      <h2>О Компании</h2>
      <p className="about-company-text">{ABOUT_TEXT}</p>
    </section>
  );
}
