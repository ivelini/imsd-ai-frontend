// Кастомный сервер Next для прода (docs: 01-app/02-guides/custom-server.md).
// Панель ISPmanager запускает приложение как `npm start` и передаёт адрес unix-сокета
// в SOCKET (nginx проксирует на него всё, чего нет файлом в каталоге сайта).
// `next start` unix-сокет не умеет — поэтому сервер поднимается программно.
// Локально без SOCKET слушает http://0.0.0.0:3000 (PORT переопределяет порт).
import fs from "node:fs";
import http from "node:http";
import next from "next";

process.env.NODE_ENV ||= "production";

const app = next({ dev: false, dir: import.meta.dirname });
const handle = app.getRequestHandler();

await app.prepare();

const server = http.createServer((req, res) => handle(req, res));

const socketPath = process.env.SOCKET;
if (socketPath) {
  // Сокет от прошлого запуска мешает listen — убираем (права 0660: пишет nginx группы www-data)
  if (fs.existsSync(socketPath)) fs.unlinkSync(socketPath);
  server.listen(socketPath, () => {
    fs.chmodSync(socketPath, 0o660);
    console.log(`> Ready on unix:${socketPath}`);
  });
} else {
  const port = parseInt(process.env.PORT || "3000", 10);
  const hostname = process.env.HOST || "0.0.0.0";
  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}
