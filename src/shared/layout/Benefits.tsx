// Плашки-бенефиты над контентом (фаза 1)
import { BENEFITS } from "@/data/nav";
import { BenefitIcon } from "./icons";

export function Benefits() {
  return (
    <div className="benefits">
      {BENEFITS.map((b) => (
        <a href="#" className={`benefit benefit--${b.type}`} key={b.type}>
          <BenefitIcon type={b.type} />
          <span>{b.text}</span>
        </a>
      ))}
    </div>
  );
}
