import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, X } from "lucide-react";
import notificationService from "../services/notificationService";
import { formatDate } from "../utils/formatDate";

const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationService.getMyNotifications();
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent — a failed notification fetch shouldn't disrupt the rest of the page
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close the dropdown on an outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (notification) => {
    if (notification.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationService.markAsRead(notification._id);
    } catch {
      fetchNotifications(); // resync on failure
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const wasUnread = notifications.find((n) => n._id === id)?.isRead === false;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationService.deleteNotification(id);
    } catch {
      fetchNotifications();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-bold leading-none text-cream-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-ink-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <span className="text-sm font-semibold text-ink-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-rust-500">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-400">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleMarkRead(n)}
                  className={`flex w-full items-start justify-between gap-2 border-b border-ink-50 px-4 py-3 text-left text-sm hover:bg-cream-50 ${
                    n.isRead ? "" : "bg-forest-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-rust-500" />}
                      <p className="font-semibold text-ink-800">{n.title}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink-400">{formatDate(n.createdAt)}</p>
                  </div>
                  <span
                    onClick={(e) => handleDelete(e, n._id)}
                    role="button"
                    aria-label="Delete notification"
                    className="shrink-0 rounded-full p-1 text-ink-300 hover:bg-ink-100 hover:text-ink-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))
            )}
          </div>

          {notifications.some((n) => n.relatedOrder) && (
            <div className="border-t border-ink-100 px-4 py-2 text-center">
              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-forest-600 hover:underline"
              >
                View my orders
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
