import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import chatService from "../../services/chatService";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Load the conversation list once
  useEffect(() => {
    chatService
      .getChats()
      .then(({ data }) => setChats(data.chats || data || []))
      .catch(() => {
        setChats([]);
        toast.error("Could not load your conversations");
      })
      .finally(() => setLoadingChats(false));
  }, []);

  // Load the selected conversation's messages, and mark it read
  useEffect(() => {
    if (!conversationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveChat(null);
      setMessages([]);
      return;
    }

    let active = true;
    setLoadingMessages(true);

    chatService
      .getChatById(conversationId)
      .then(({ data }) => {
        if (!active) return;
        setActiveChat(data.chat || data);
        setMessages(data.messages || data.chat?.messages || []);
      })
      .catch(() => {
        if (active) {
          setActiveChat(null);
          setMessages([]);
          toast.error("Could not load this conversation");
        }
      })
      .finally(() => active && setLoadingMessages(false));

    chatService.markAsRead(conversationId).catch(() => {});
    setChats((prev) => prev.map((c) => ((c._id || c.id) === conversationId ? { ...c, unreadCount: 0 } : c)));

    return () => {
      active = false;
    };
  }, [conversationId]);

  // Optional real-time layer — no-ops cleanly if the backend has no socket server
  const socketRef = useRef(null);
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    socket.emit("join_chat", { chatId: conversationId });

    const handleNewMessage = (payload) => {
      const incoming = payload?.message || payload;
      const chatId = payload?.chatId || incoming?.chatId;
      if (chatId && chatId !== conversationId) return;

      setMessages((prev) => {
        if (prev.some((m) => (m._id || m.id) === (incoming._id || incoming.id))) return prev;
        return [...prev, incoming];
      });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_chat", { chatId: conversationId });
      socket.off("new_message", handleNewMessage);
    };
  }, [conversationId]);

  const handleSend = async (text) => {
    if (!conversationId) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      text,
      sender: currentUserId,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setSending(true);

    try {
      const { data } = await chatService.sendMessage(conversationId, text);
      const savedMessage = data.message || data;
      setMessages((prev) => prev.map((m) => (m._id === tempId ? savedMessage : m)));
      setChats((prev) =>
        prev.map((c) =>
          (c._id || c.id) === conversationId
            ? { ...c, lastMessage: savedMessage, updatedAt: savedMessage.createdAt }
            : c
        )
      );
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...m, pending: false, failed: true } : m)));
      toast.error(err.response?.data?.message || "Message could not be sent");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-0 py-0 sm:px-4 sm:py-8">
      <h1 className="mb-4 hidden px-4 text-2xl font-semibold text-ink-900 sm:block sm:px-0">Messages</h1>

      <div className="grid h-[calc(100vh-4rem)] grid-cols-1 overflow-hidden border-ink-100 bg-white sm:h-[75vh] sm:rounded-xl sm:border lg:grid-cols-[320px_1fr]">
        {/* Conversation list — hidden on mobile once a chat is open */}
        <div
          className={`overflow-y-auto border-ink-100 lg:block lg:border-r ${
            conversationId ? "hidden" : "block"
          }`}
        >
          {loadingChats ? (
            <div className="p-6">
              <LoadingSpinner label="Loading conversations..." />
            </div>
          ) : (
            <div className={chats.length === 0 ? "p-4" : ""}>
              <ConversationList chats={chats} activeId={conversationId} currentUserId={currentUserId} />
            </div>
          )}
        </div>

        {/* Chat window — hidden on mobile until a conversation is selected */}
        <div className={`${conversationId ? "block" : "hidden"} lg:block`}>
          <ChatWindow
            chat={activeChat}
            messages={messages}
            currentUserId={currentUserId}
            onSend={handleSend}
            sending={sending}
            loading={loadingMessages}
          />
        </div>
      </div>
    </div>
  );
}
