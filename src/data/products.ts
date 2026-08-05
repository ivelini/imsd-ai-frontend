// Мок-данные главной (05.08.2026)
// Имитация ответа GET /api/service-page/main (структура 1-в-1, поля как у бэка).
// Цены — числа (формат на фронте); заголовки секций и блоки скидок — статичны
// (решение 05.08.2026: их нет в API).
import type { HomeData } from "@/features/home/types";

export const HOME_DATA: HomeData = {
  attention_blocks: [
    {
      title: "20% на услуги шиномонтажа",
      link: "/service-page/servis",
      link_name: "Сервис",
      color: "#dd062a",
    },
    {
      title: "Сборка комплекта шин и дисков бесплатно",
      link: "/service-page/dostavka-i-oplata",
      link_name: "Доставка и оплата",
      color: "#ffc10a",
    },
    {
      title: "Хранение до монтажа бесплатно",
      link: "/service-page/magaziny",
      link_name: "Магазины",
      color: "#178e42",
    },
  ],
  slider: {
    tires: [
      {
        image: "/assets/img/wheel-product.png",
        title: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
        link: "/tires/viatti-strada-2/185-60-r15-84h",
        season: "summer",
        price: 29999,
        old_price: 32200,
      },
      {
        image: "/assets/img/wheel-product.png",
        title: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
        link: "/tires/viatti-strada-2/185-60-r15-84h",
        season: "summer",
        price: 29999,
        old_price: 32200,
      },
      {
        image: "/assets/img/wheel-product.png",
        title: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
        link: "/tires/viatti-strada-2/185-60-r15-84h",
        season: "summer",
        price: 29999,
        old_price: 32200,
      },
      {
        image: "/assets/img/wheel-product.png",
        title: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
        link: "/tires/viatti-strada-2/185-60-r15-84h",
        season: "summer",
        price: 29999,
        old_price: 32200,
      },
      {
        image: "/assets/img/wheel-product.png",
        title: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
        link: "/tires/viatti-strada-2/185-60-r15-84h",
        season: "summer",
        price: 29999,
        old_price: 32200,
      },
    ],
    wheels: [
      {
        image: "/assets/img/disk-1.png",
        title: "Диск R15 5×100 45 мм 6J",
        link: "/catalog/wheels",
        price: 10990,
        old_price: 12500,
      },
      {
        image: "/assets/img/disk-2.png",
        title: "Диск R16 5×112 40 мм 7J",
        link: "/catalog/wheels",
        price: 12990,
        old_price: 14500,
      },
      {
        image: "/assets/img/disk-1.png",
        title: "Диск R15 5×100 45 мм 6J",
        link: "/catalog/wheels",
        price: 10990,
        old_price: 12500,
      },
      {
        image: "/assets/img/disk-2.png",
        title: "Диск R16 5×112 40 мм 7J",
        link: "/catalog/wheels",
        price: 12990,
        old_price: 14500,
      },
      {
        image: "/assets/img/disk-1.png",
        title: "Диск R15 5×100 45 мм 6J",
        link: "/catalog/wheels",
        price: 10990,
        old_price: 12500,
      },
    ],
  },
  news: [
    {
      image: "/assets/img/news.png",
      title: "Как выбрать зимнюю резину: советы автоэксперта",
      link: "/articles/kak-vybrat-zimnyuyu-rezinu",
      description:
        "Разбираемся, чем отличаются шипованные и фрикционные шины, как выбрать протектор и индекс скорости.",
    },
    {
      image: "/assets/img/news.png",
      title: "Шиномонтаж: что нужно знать перед визитом",
      link: "/articles/shinomontazh",
      description:
        "Рассказываем, как подготовиться к визиту в шиномонтаж и зачем нужна балансировка колёс.",
    },
    {
      image: "/assets/img/news.png",
      title: "Летние шины 2026: обзор новинок",
      link: "/articles/letnie-shiny-2026",
      description:
        "Обзор самых интересных летних новинок сезона и технологий, которые заслуживают внимания.",
    },
  ],
  description: `Интернет-магазин «Автоальянс» — это шины и диски для легковых автомобилей, кроссоверов и внедорожников. Собственный склад в Челябинске, широкий ассортимент известных брендов, шиномонтаж и бесплатное хранение комплекта до монтажа. Подберём резину под ваш автомобиль, поможем с выбором и доставим заказ в любой регион России.`,
  seo: {
    title: "Альянс — шины и диски",
    description:
      "Интернет-магазин шин и дисков в Челябинске: каталог зимних и летних шин, колёсные диски, шиномонтаж, доставка по России.",
  },
};
