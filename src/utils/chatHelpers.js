export function getOtherParticipant(chat, currentUserId) {
  if (!chat) return null;
  if (Array.isArray(chat.participants)) {
    return chat.participants.find((p) => (p._id || p.id) !== currentUserId) || chat.participants[0];
  }
  if (chat.buyer && chat.seller) {
    return (chat.buyer._id || chat.buyer.id) === currentUserId ? chat.seller : chat.buyer;
  }
  return chat.otherUser || chat.recipient || null;
}

export function getChatProduct(chat) {
  return chat?.product || chat?.relatedProduct || null;
}
