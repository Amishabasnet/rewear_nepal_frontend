import { ROLE_META } from "../../utils/constants";

export default function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.buyer;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${meta.className}`}>
      {meta.label}
    </span>
  );
}
