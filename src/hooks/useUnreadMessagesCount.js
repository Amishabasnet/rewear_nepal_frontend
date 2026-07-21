import { useEffect, useState } from "react";
import chatService from "../services/chatService";

const POLL_INTERVAL = 30000;

// Polls the chat list to keep a lightweight unread-count badge fresh.
// Falls back to 0 silently if the endpoint isn't reachable.
export function useUnreadMessagesCount(enabled) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }

    let active = true;

    const load = () => {
      chatService
        .getChats()
        .then(({ data }) => {
          if (!active) return;
          const chats = data.chats || data || [];
          const total = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setCount(total);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [enabled]);

  return count;
}
