// Плашки-бенефиты: серверные, данные через props (03.08.2026)
// Данные — attention_blocks из /api/service-page/main (color hex; link —
// путь по конвенции service_pages). Иконка — по индексу плашки (red/gold/
// green, как в мокапе: иконок в API нет).
import type { AttentionBlock } from "@/features/home/types";
import { BenefitIcon } from "./icons";

interface BenefitsProps {
  benefits: AttentionBlock[];
}

const ICONS = ["red", "gold", "green"] as const;

export function Benefits({ benefits }: BenefitsProps) {
  return (
    <div className="benefits">
      {benefits.map((b, i) => (
        <a
          href={b.link}
          className="benefit"
          style={{ background: b.color }}
          key={`${b.link}-${i}`}
        >
          <BenefitIcon type={ICONS[i % ICONS.length]} />
          <span>{b.title}</span>
        </a>
      ))}
    </div>
  );
}
