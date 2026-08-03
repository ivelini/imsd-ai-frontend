// Секция «О компании»: серверный, данные через props (03.08.2026)

interface AboutCompanyProps {
  text: string;
}

export function AboutCompany({ text }: AboutCompanyProps) {
  return (
    <section className="about-company-section container">
      <h2>О Компании</h2>
      <p className="about-company-text">{text}</p>
    </section>
  );
}
