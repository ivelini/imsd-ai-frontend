// Баррел API-слоя: единая точка входа (контракт с потребителями).
// Секции разнесены по доменным модулям: base, nav, geo, home,
// catalog, vehicle, product, cart, checkout, auth, articles, booking.
// При API: замена моков на fetch внутри модулей, контракт не меняется.
export * from "./base";
export * from "./nav";
export * from "./geo";
export * from "./home";
export * from "./catalog";
export * from "./vehicle";
export * from "./booking";
export * from "./product";
export * from "./cart";
export * from "./checkout";
export * from "./auth";
export * from "./articles";
