import { ORDER_STATUS_META } from "../utils/constants";

export default function OrderStatusBadge({ status, className = "" }) {
  const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${meta.className} ${className}`}>
      {meta.label}
    </span>
  );
}
