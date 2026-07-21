import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { getOtherParticipant, getChatProduct } from "../../utils/chatHelpers";
import { formatChatTime } from "../../utils/formatChatTime";
import EmptyState from "../EmptyState";

export default function ConversationList({ chats, activeId, currentUserId }) {
  if (chats.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        message="Message a seller from a product page to start chatting."
      />
    );
  }

  return (
    <div className="divide-y divide-ink-50">
      {chats.map((chat) => {
        const id = chat._id || chat.id;
        const other = getOtherParticipant(chat, currentUserId);
        const product = getChatProduct(chat);
        const lastMessage = chat.lastMessage;
        const unread = chat.unreadCount || 0;
        const isActive = id === activeId;

        return (
          <Link
            key={id}
            to={`/messages/${id}`}
            className={`flex items-center gap-3 p-3.5 transition ${
              isActive ? "bg-rust-50/60" : "hover:bg-cream-50"
            }`}
          >
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-100 font-semibold text-forest-700">
                {other?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-bold text-cream-50">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-sm ${unread > 0 ? "font-bold text-ink-900" : "font-semibold text-ink-800"}`}>
                  {other?.name || other?.shopName || "User"}
                </p>
                <span className="shrink-0 text-[11px] text-ink-400">
                  {formatChatTime(lastMessage?.createdAt || chat.updatedAt)}
                </span>
              </div>
              {product && (
                <p className="truncate text-xs text-ink-400">
                  Re: {product.title || product.name}
                </p>
              )}
              <p className={`truncate text-xs ${unread > 0 ? "font-semibold text-ink-700" : "text-ink-500"}`}>
                {lastMessage?.text || "Say hello 👋"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
