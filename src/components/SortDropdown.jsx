import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "../utils/constants";

export default function SortDropdown({ value = "newest", onChange }) {
  return (
    <div className="relative">
      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field !py-2.5 !pl-9 appearance-none pr-8 text-sm"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
