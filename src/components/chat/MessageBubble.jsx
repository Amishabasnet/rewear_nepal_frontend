import { formatChatTime } from "../../utils/formatChatTime";

export default function MessageBubble({ message, isOwn }) {
  const status = message.pending ? "Sending…" : message.failed ? "Failed to send" : null;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] sm:max-w-[65%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
            isOwn
              ? "rounded-br-sm bg-rust-500 text-cream-50"
              : "rounded-bl-sm border border-ink-100 bg-white text-ink-800"
          } ${message.failed ? "opacity-60" : ""}`}
        >
          {message.text}
        </div>
        <span className="mt-1 px-1 text-[10px] text-ink-400">
          {status || formatChatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
