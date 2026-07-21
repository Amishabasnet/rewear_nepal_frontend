export const CONDITIONS = [
  { value: "new_with_tag", label: "New with tag" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export const CONDITION_LABEL = CONDITIONS.reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {});

export const CATEGORIES = [
  "Women's Wear",
  "Men's Wear",
  "Kids",
  "Footwear",
  "Bags & Accessories",
  "Traditional Wear",
];

export const GENDERS = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export const BRANDS = [
  "Levi's",
  "Fabindia",
  "Fossil",
  "Nike",
  "Uniqlo",
  "H&M",
  "Zara",
  "Local Weave",
  "Mango",
  "Clarks",
];

export const LOCATIONS = [
  "Kathmandu",
  "Pokhara",
  "Lalitpur",
  "Bhaktapur",
  "Chitwan",
  "Biratnagar",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most popular" },
];

// Admin approval status for products a seller lists
export const PRODUCT_STATUS_META = {
  pending: { label: "Pending", className: "bg-mustard-100 text-ink-800" },
  approved: { label: "Approved", className: "bg-forest-100 text-forest-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-600" },
};

// Order lifecycle — shared between order list, order detail, and seller order views
export const ORDER_STATUS_META = {
  pending: { label: "Pending", className: "bg-mustard-100 text-ink-800" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", className: "bg-indigo-100 text-indigo-700" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", className: "bg-forest-600 text-cream-50" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600" },
};

// Linear progress order for the tracker — cancelled is handled separately
export const ORDER_PROGRESS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];
