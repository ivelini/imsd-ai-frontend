// Рейтинг: .rating-block (звёзды + число). value — десятичный рейтинг (4.3)
// Звёзды: полные по округлению вниз (в мокапе 4.3 → 4 gold + 1 white)
export function Rating({ value }: { value: string }) {
  const full = Math.round(parseFloat(value.replace(",", ".")));
  const stars = Array.from({ length: 5 }, (_, i) => (
    <img key={i} src={i < full ? "/assets/img/gold-star.svg" : "/assets/img/white-star.svg"} alt="" />
  ));
  return (
    <div className="rating-block">
      <div className="rating-stars">{stars}</div>
      <span className="num-rating">{value}</span>
    </div>
  );
}
