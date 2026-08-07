// Баррел API-слоя: единая точка входа (контракт с потребителями).
// Секции разнесены по доменным модулям: base, nav, geo, home,
// service-pages, catalog, product, cart, checkout, auth, articles, seo.
// При API: замена моков на fetch внутри модулей, контракт не меняется.
export * from "./base";
export * from "./nav";
export * from "./geo";
export * from "./home";
export * from "./service-pages";
export * from "./catalog";
export * from "./product";
export * from "./cart";
export * from "./checkout";
export * from "./auth";
export * from "./articles";
export * from "./seo";
