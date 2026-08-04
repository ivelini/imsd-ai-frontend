// Гео-данные из .template/popups/geo.html (регионы, 88 городов)
// Фаза 1: заменить на API (Laravel)

export interface GeoCity {
  id: string;
  label: string;
  value: string;
  regionId: string;
}

export interface GeoRegion {
  id: string;
  name: string;
}

export const GEO_REGIONS: GeoRegion[] = [
  { id: "1132", name: "Челябинская обл" },
  { id: "994", name: "Свердловская обл" },
  { id: "594", name: "Курганская обл" },
];

export const GEO_CITIES: GeoCity[] = [
  // Челябинская обл (1132)
  { id: "1150", label: "Аша", value: "asha", regionId: "1132" },
  { id: "1155", label: "Бакал", value: "bakal", regionId: "1132" },
  { id: "1157", label: "Верхнеуральск", value: "verkhneural-sk", regionId: "1132" },
  { id: "1133", label: "Верхний Уфалей", value: "verkhniy-ufaley", regionId: "1132" },
  { id: "1160", label: "Еманжелинск", value: "emanzhelinsk", regionId: "1132" },
  { id: "1134", label: "Златоуст", value: "zlatoust", regionId: "1132" },
  { id: "1135", label: "Карабаш", value: "karabash", regionId: "1132" },
  { id: "1151", label: "Карталы", value: "kartaly", regionId: "1132" },
  { id: "1152", label: "Касли", value: "kasli", regionId: "1132" },
  { id: "1154", label: "Катав-Ивановск", value: "katav-ivanovsk", regionId: "1132" },
  { id: "1136", label: "Копейск", value: "kopeysk", regionId: "1132" },
  { id: "1161", label: "Коркино", value: "korkino", regionId: "1132" },
  { id: "1158", label: "Куса", value: "kusa", regionId: "1132" },
  { id: "1137", label: "Кыштым", value: "kyshtym", regionId: "1132" },
  { id: "1138", label: "Магнитогорск", value: "magnitogorsk", regionId: "1132" },
  { id: "1139", label: "Миасс", value: "miass", regionId: "1132" },
  { id: "1148", label: "Миньяр", value: "min-yar", regionId: "1132" },
  { id: "1159", label: "Нязепетровск", value: "nyazepetrovsk", regionId: "1132" },
  { id: "1140", label: "Озерск", value: "ozersk", regionId: "1132" },
  { id: "1162", label: "Пласт", value: "plast", regionId: "1132" },
  { id: "1156", label: "Сатка", value: "satka", regionId: "1132" },
  { id: "1149", label: "Сим", value: "sim", regionId: "1132" },
  { id: "1141", label: "Снежинск", value: "snezhinsk", regionId: "1132" },
  { id: "1142", label: "Трехгорный", value: "trekhgornyy", regionId: "1132" },
  { id: "1145", label: "Трехгорный-1", value: "trekhgornyy-1", regionId: "1132" },
  { id: "1147", label: "Троицк", value: "troitsk", regionId: "1132" },
  { id: "1143", label: "Усть-Катав", value: "ust-katav", regionId: "1132" },
  { id: "1146", label: "Чебаркуль", value: "chebarkul", regionId: "1132" },
  { id: "1132", label: "Челябинск", value: "chelyabinsk", regionId: "1132" },
  { id: "1144", label: "Южноуральск", value: "yuzhnoural-sk", regionId: "1132" },
  { id: "1153", label: "Юрюзань", value: "yuryuzan", regionId: "1132" },
  // Свердловская обл (994)
  { id: "1015", label: "Алапаевск", value: "alapaevsk", regionId: "994" },
  { id: "1038", label: "Арамиль", value: "aramil", regionId: "994" },
  { id: "1026", label: "Артемовский", value: "artemovskiy", regionId: "994" },
  { id: "995", label: "Асбест", value: "asbest", regionId: "994" },
  { id: "996", label: "Березовский", value: "berezovskiy", regionId: "994" },
  { id: "1027", label: "Богданович", value: "bogdanovich", regionId: "994" },
  { id: "1021", label: "Верхний Тагил", value: "verkhniy-tagil", regionId: "994" },
  { id: "997", label: "Верхняя Пышма", value: "verkhnyaya-pyshma", regionId: "994" },
  { id: "1028", label: "Верхняя Салда", value: "verkhnyaya-salda", regionId: "994" },
  { id: "1024", label: "Верхняя Тура", value: "verkhnyaya-tura", regionId: "994" },
  { id: "1029", label: "Верхотурье", value: "verkhotur-e", regionId: "994" },
  { id: "1023", label: "Волчанск", value: "volchansk", regionId: "994" },
  { id: "1025", label: "Дегтярск", value: "degtyarsk", regionId: "994" },
  { id: "994", label: "Екатеринбург", value: "ekaterinburg", regionId: "994" },
  { id: "998", label: "Заречный", value: "zarechnyy", regionId: "994" },
  { id: "999", label: "Ивдель", value: "ivdel", regionId: "994" },
  { id: "1017", label: "Ирбит", value: "irbit", regionId: "994" },
  { id: "1013", label: "Каменск-Уральский", value: "kamensk-ural-skiy", regionId: "994" },
  { id: "1018", label: "Камышлов", value: "kamyshlov", regionId: "994" },
  { id: "1000", label: "Карпинск", value: "karpinsk", regionId: "994" },
  { id: "1001", label: "Качканар", value: "kachkanar", regionId: "994" },
  { id: "1002", label: "Кировград", value: "kirovgrad", regionId: "994" },
  { id: "1003", label: "Краснотурьинск", value: "krasnotur-insk", regionId: "994" },
  { id: "1004", label: "Красноуральск", value: "krasnoural-sk", regionId: "994" },
  { id: "1019", label: "Красноуфимск", value: "krasnoufimsk", regionId: "994" },
  { id: "1005", label: "Кушва", value: "kushva", regionId: "994" },
  { id: "1006", label: "Лесной", value: "lesnoy", regionId: "994" },
  { id: "1033", label: "Михайловск", value: "mikhaylovsk", regionId: "994" },
  { id: "1030", label: "Невьянск", value: "nev-yansk", regionId: "994" },
  { id: "1032", label: "Нижние Серги", value: "nizhnie-sergi", regionId: "994" },
  { id: "1031", label: "Нижние Серги-3", value: "nizhnie-sergi-3", regionId: "994" },
  { id: "1014", label: "Нижний Тагил", value: "nizhniy-tagil", regionId: "994" },
  { id: "1016", label: "Нижняя Салда", value: "nizhnyaya-salda", regionId: "994" },
  { id: "1007", label: "Нижняя Тура", value: "nizhnyaya-tura", regionId: "994" },
  { id: "1034", label: "Новая Ляля", value: "novaya-lyalya", regionId: "994" },
  { id: "1008", label: "Новоуральск", value: "novoural-sk", regionId: "994" },
  { id: "1009", label: "Первоуральск", value: "pervoural-sk", regionId: "994" },
  { id: "1010", label: "Полевской", value: "polevskoy", regionId: "994" },
  { id: "1011", label: "Ревда", value: "revda", regionId: "994" },
  { id: "1035", label: "Реж", value: "rezh", regionId: "994" },
  { id: "1012", label: "Североуральск", value: "severoural-sk", regionId: "994" },
  { id: "1020", label: "Серов", value: "serov", regionId: "994" },
  { id: "1022", label: "Среднеуральск", value: "sredneural-sk", regionId: "994" },
  { id: "1036", label: "Сухой Лог", value: "sukhoy-log", regionId: "994" },
  { id: "1037", label: "Сысерть", value: "sysert", regionId: "994" },
  { id: "1039", label: "Тавда", value: "tavda", regionId: "994" },
  { id: "1040", label: "Талица", value: "talitsa", regionId: "994" },
  { id: "1041", label: "Туринск", value: "turinsk", regionId: "994" },
  // Курганская обл (594)
  { id: "596", label: "Далматово", value: "dalmatovo", regionId: "594" },
  { id: "597", label: "Катайск", value: "kataysk", regionId: "594" },
  { id: "594", label: "Курган", value: "kurgan", regionId: "594" },
  { id: "598", label: "Куртамыш", value: "kurtamysh", regionId: "594" },
  { id: "599", label: "Макушино", value: "makushino", regionId: "594" },
  { id: "600", label: "Петухово", value: "petukhovo", regionId: "594" },
  { id: "595", label: "Шадринск", value: "shadrinsk", regionId: "594" },
  { id: "601", label: "Шумиха", value: "shumikha", regionId: "594" },
  { id: "602", label: "Щучье", value: "shchuch-e", regionId: "594" },
];

export const DEFAULT_CITY = "Челябинск";
export const DEFAULT_CITY_VALUE = "chelyabinsk";
