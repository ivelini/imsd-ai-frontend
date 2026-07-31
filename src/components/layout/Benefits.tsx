import { BENEFITS } from "@/data/nav";
import { BenefitIcon } from "./icons";

export function Benefits() {
  return (
    <div className="benefits">
      {BENEFITS.map((b) => (
        <a href="#" className={`benefit benefit--${b.mod}`} key={b.mod}>
          <BenefitIcon kind={b.mod} />
          <span>{b.text}</span>
        </a>
      ))}
    </div>
  );
}
