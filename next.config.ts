import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Dev через Docker: браузер открывает localhost/127.0.0.1 или LAN-IP
  // (192.168.135.100 — Windows-хост за portproxy). Без разрешённых origin
  // Next.js dev блокирует cross-origin запросы к /_next/* (бандлы, HMR-websocket)
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.135.100", "10.0.10.16"],
};

export default nextConfig;
