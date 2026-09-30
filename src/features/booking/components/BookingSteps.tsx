// Степпер потока записи: пройденные шаги — ссылки назад, текущий и будущие — не кликабельны
import Link from "next/link";

const STEPS = [
  { number: 1, title: "Время", href: "/booking" },
  { number: 2, title: "Услуги", href: "/booking/services" },
  { number: 3, title: "Данные", href: "/booking/details" },
  { number: 4, title: "Подтверждение", href: "/booking/code" },
];

interface BookingStepsProps {
  active: number;
}

export function BookingSteps({ active }: BookingStepsProps) {
  return (
    <div className="steps">
      {STEPS.map((step) => {
        const className =
          step.number < active ? "step step--done" : step.number === active ? "step step--active" : "step";

        const content = (
          <>
            <span className="step-num">{step.number}</span>
            <span className="step-title">{step.title}</span>
          </>
        );

        return step.number < active ? (
          <Link key={step.number} className={className} href={step.href}>
            {content}
          </Link>
        ) : (
          <span key={step.number} className={className}>
            {content}
          </span>
        );
      })}
    </div>
  );
}
