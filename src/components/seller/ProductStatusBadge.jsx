import { PRODUCT_STATUS_META } from "../../utils/constants";

export default function ProductStatusBadge({ status }) {
  const meta = PRODUCT_STATUS_META[status] || PRODUCT_STATUS_META.pending;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
