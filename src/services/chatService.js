import api from "./api";

const chatService = {
  getChats: () => api.get("/chats"),
  getChatById: (id) => api.get(`/chats/${id}`),
  startChat: (payload) => api.post("/chats/start", payload),
  sendMessage: (id, text) => api.post(`/chats/${id}/messages`, { text }),
  markAsRead: (id) => api.put(`/chats/${id}/read`),
};

export default chatService;
