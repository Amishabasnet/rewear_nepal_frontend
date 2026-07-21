import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socket = null;

export function getSocket() {
  if (socket) return socket;

  try {
    socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("rewear_token") },
      autoConnect: true,
      reconnectionAttempts: 3,
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", () => {
      // Silently degrade — REST polling/manual refresh still works.
    });
  } catch {
    socket = null;
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
