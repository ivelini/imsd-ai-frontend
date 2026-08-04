import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Dev через Docker: браузер открывает localhost/127.0.0.1,
  // без allowedDevOrigins Firefox блокирует cross-origin JS-бандлы
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
