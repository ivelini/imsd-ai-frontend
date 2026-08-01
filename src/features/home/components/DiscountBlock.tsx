// Блок эксклюзивной скидки (фаза 1)
import { Button } from "@/shared/ui/Button";

export function DiscountBlock() {
  return (
    <section className="discount-block">
      <h2 className="block-title">
        Эксклюзивная Скидка: 10% <br />
        На литые диски!
      </h2>
      <p className="block-text">*максимальная скидка при покупке комплекта шин.</p>
      <Button href="#" className="block-button primary-button">Подробнее</Button>
    </section>
  );
}
