import PriceRangeFilter from "./PriceRangeFilter";
import { CATEGORIES, GENDERS, SIZES, BRANDS, CONDITIONS, LOCATIONS } from "../utils/constants";

export default function FilterSidebar({ filters, onChange, onClear }) {
  const toggleArrayValue = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ [key]: next });
  };

  const activeCount =
    (filters.category?.length || 0) +
    (filters.gender?.length || 0) +
    (filters.size?.length || 0) +
    (filters.brand?.length || 0) +
    (filters.condition?.length || 0) +
    (filters.location?.length || 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink-900">
          Filters {activeCount > 0 && <span className="text-rust-500">({activeCount})</span>}
        </h3>
        <button onClick={onClear} className="text-xs font-semibold text-rust-500 hover:underline">
          Clear all
        </button>
      </div>

      <FilterGroup title="Category">
        {CATEGORIES.map((c) => (
          <Checkbox
            key={c}
            label={c}
            checked={(filters.category || []).includes(c)}
            onChange={() => toggleArrayValue("category", c)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Gender">
        {GENDERS.map((g) => (
          <Checkbox
            key={g.value}
            label={g.label}
            checked={(filters.gender || []).includes(g.value)}
            onChange={() => toggleArrayValue("gender", g.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <ChipToggle
              key={size}
              label={size}
              active={(filters.size || []).includes(size)}
              onClick={() => toggleArrayValue("size", size)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        {BRANDS.map((b) => (
          <Checkbox
            key={b}
            label={b}
            checked={(filters.brand || []).includes(b)}
            onChange={() => toggleArrayValue("brand", b)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Condition">
        {CONDITIONS.map((c) => (
          <Checkbox
            key={c.value}
            label={c.label}
            checked={(filters.condition || []).includes(c.value)}
            onChange={() => toggleArrayValue("condition", c.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price range (NPR)">
        <PriceRangeFilter
          minPrice={filters.minPrice || ""}
          maxPrice={filters.maxPrice || ""}
          onApply={(range) => onChange(range)}
        />
      </FilterGroup>

      <FilterGroup title="Location">
        {LOCATIONS.map((loc) => (
          <Checkbox
            key={loc}
            label={loc}
            checked={(filters.location || []).includes(loc)}
            onChange={() => toggleArrayValue("location", loc)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-t border-ink-100 pt-4 first:border-t-0 first:pt-0">
      <p className="mb-2.5 text-sm font-semibold text-ink-800">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-ink-300 text-rust-500 focus:ring-rust-500"
      />
      {label}
    </label>
  );
}

function ChipToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active ? "border-rust-500 bg-rust-50 text-rust-600" : "border-ink-200 text-ink-600 hover:border-ink-400"
      }`}
    >
      {label}
    </button>
  );
}
