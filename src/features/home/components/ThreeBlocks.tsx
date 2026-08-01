// Три блока: отзывы / гарантия / помощь (фаза 1)
import { Rating } from "@/shared/ui/Rating";
import { Button } from "@/shared/ui/Button";

export function ThreeBlocks() {
  return (
    <section className="three-blocks container">
      <div className="block customer-reviews">
        <h3 className="block-title">Отзывы покупателей Автоальянс</h3>
        <Rating value="4,3" />
        <Button type="button" className="white-button">Читать отзывы</Button>
        <img className="decoration" src="/assets/img/korona.svg" alt="" />
      </div>

      <div className="block manufacturer-warranty">
        <h3 className="block-title">Мы поддерживаем все расширенные гарантии производителя</h3>
        <Button type="button" className="primary-button red-btn">Гарантия на шины</Button>
        <img className="decoration" src="/assets/img/galki.svg" alt="" />
      </div>

      <div className="block help-and-selection">
        <h3 className="block-title">Нужна помощь в подборе? Узнать страну, дату выпуска шин?</h3>
        <Button type="button" className="primary-button red-btn">Хочу общаться</Button>
        <img className="decoration" src="/assets/img/Group 33992.svg" alt="" />
      </div>
    </section>
  );
}
