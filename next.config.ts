import type { NextConfig } from "next";

// Бэк в dev-контейнере доступен по docker-имени (сеть imsd-ai);
// локальный dev вне Docker: BACKEND_URL=http://localhost:8081
const BACKEND_URL = process.env.BACKEND_URL ?? "http://imsd-backend-nginx";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Dev через Docker: браузер открывает localhost/127.0.0.1 или LAN-IP
  // (192.168.135.100 — Windows-хост за portproxy). Без разрешённых origin
  // Next.js dev блокирует cross-origin запросы к /_next/* (бандлы, HMR-websocket)
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.135.100", "10.0.10.16"],
  // /api/* → бэк: same-origin для браузера (CORS не нужен). Источник истины
  // маршрутов — ../backend/documentations/scramble/public-api.json
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
