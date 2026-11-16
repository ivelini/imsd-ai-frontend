"use client";
// Панель запуска чата на всех страницах (клиентский остров в layout).
// Мобильный — круглая кнопка, с 640 px — плашка с подписью (решение согласовано).
// Окно грузится отдельным чанком при первом открытии: в основном бандле остаётся кнопка.
import { useState } from "react";
import dynamic from "next/dynamic";
import { ChatBubbleIcon } from "@/features/chat/components/ChatIcons";

const ChatWindow = dynamic(
  () => import("@/features/chat/components/ChatWindow").then((module) => module.ChatWindow),
  { ssr: false },
);

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  if (open) {
    return <ChatWindow onClose={() => setOpen(false)} />;
  }

  return (
    <button
      className="chat-launcher chat-launcher-plate"
      type="button"
      aria-label="Открыть чат"
      onClick={() => setOpen(true)}
    >
      <ChatBubbleIcon size={20} />
      <span className="chat-launcher-label">Чат с ассистентом</span>
    </button>
  );
}
