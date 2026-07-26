export function formatOrderNumber(id) {
  if (!id) return "N/A";
  return id.toString().slice(-6).toUpperCase();
}

export default formatOrderNumber;
