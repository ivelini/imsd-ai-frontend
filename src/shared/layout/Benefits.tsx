// Плашки-бенефиты над контентом: серверные, данные через props (03.08.2026)
import type { Benefit } from "@/data/nav";
import { BenefitIcon } from "./icons";

interface BenefitsProps {
  benefits: Benefit[];
}

export function Benefits({ benefits }: BenefitsProps) {
  return (
    <div className="benefits">
      {benefits.map((b) => (
        <a href="#" className={`benefit benefit--${b.type}`} key={b.type}>
          <BenefitIcon type={b.type} />
          <span>{b.text}</span>
        </a>
      ))}
    </div>
  );
}
