const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function getImageUrl(image) {
  const raw = typeof image === "string" ? image : image?.url;
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }
  return `${SERVER_ORIGIN}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

export function getImageUrls(images = []) {
  return (images || []).map(getImageUrl).filter(Boolean);
}

export default getImageUrl;
