import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
import { getOtherParticipant, getChatProduct } from "../../utils/chatHelpers";
import { formatNPR } from "../../utils/formatCurrency";

export default function ChatWindow({ chat, messages, currentUserId, onSend, sending, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner label="Loading conversation..." />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          icon={MessageCircle}
          title="Select a conversation"
          message="Pick a chat from the list to see your messages."
        />
      </div>
    );
  }

  const other = getOtherParticipant(chat, currentUserId);
  const product = getChatProduct(chat);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-ink-100 bg-white p-3.5">
        <Link to="/messages" className="rounded-full p-1.5 hover:bg-cream-100 lg:hidden" aria-label="Back to conversations">
          <ArrowLeft className="h-4 w-4 text-ink-600" />
        </Link>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-100 font-semibold text-forest-700">
          {other?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">
            {other?.name || other?.shopName || "User"}
          </p>
          {other?.shopName && other?.name && (
            <p className="truncate text-xs text-ink-400">{other.shopName}</p>
          )}
        </div>
      </div>

      {/* Related product */}
      {product && (
        <Link
          to={`/products/${product._id || product.id}`}
          className="flex items-center gap-3 border-b border-ink-100 bg-cream-50 p-2.5 transition hover:bg-cream-100"
        >
          <img
            src={product.images?.[0] || product.image}
            alt={product.title || product.name}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink-800">{product.title || product.name}</p>
            {product.price != null && <p className="text-xs text-ink-500">{formatNPR(product.price)}</p>}
          </div>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto bg-cream-50/40 p-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No messages yet"
            message="Send a message to get the conversation started."
          />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id || message.id}
              message={message}
              isOwn={(message.sender?._id || message.senderId || message.sender) === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSend} disabled={sending} />
    </div>
  );
}
