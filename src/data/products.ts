// Мок-данные товаров из разметки мокапа (.template/index.html)
// Фаза 2: заменить на API (Laravel)

export interface HomeProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice: number;
  rating: string;
}

export const WHEEL_PRODUCTS: HomeProduct[] = [
  {
    id: "viatti-185-60-r15",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    image: "/assets/img/wheel-product.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "viatti-185-60-r15-2",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    image: "/assets/img/wheel-product.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "viatti-185-60-r15-3",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    image: "/assets/img/wheel-product.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "viatti-185-60-r15-4",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    image: "/assets/img/wheel-product.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "viatti-185-60-r15-5",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    image: "/assets/img/wheel-product.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
];

export const DISK_PRODUCTS: HomeProduct[] = [
  {
    id: "disk-vw548-1",
    name: "Диск ЛС Replica Concept Volkswagen VW548 GMF 20x9,0 5x112 ET33 DIA66,6",
    image: "/assets/img/disk-1.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "disk-vw548-2",
    name: "Диск ЛС Replica Concept Volkswagen VW548 GMF 20x9,0 5x112 ET33 DIA66,6",
    image: "/assets/img/disk-1.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "disk-vw548-3",
    name: "Диск ЛС Replica Concept Volkswagen VW548 GMF 20x9,0 5x112 ET33 DIA66,6",
    image: "/assets/img/disk-1.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "disk-vw548-4",
    name: "Диск ЛС Replica Concept Volkswagen VW548 GMF 20x9,0 5x112 ET33 DIA66,6",
    image: "/assets/img/disk-2.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
  {
    id: "disk-vw548-5",
    name: "Диск ЛС Replica Concept Volkswagen VW548 GMF 20x9,0 5x112 ET33 DIA66,6",
    image: "/assets/img/disk-2.png",
    price: 29999,
    oldPrice: 32200,
    rating: "4.8",
  },
];
