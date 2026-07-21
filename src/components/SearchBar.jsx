import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

export default function SearchBar({ value = "", onSearch, placeholder = "Search for jackets, kurtas, sneakers..." }) {
  const [input, setInput] = useState(value);
  const debounced = useDebounce(input, 400);

  // Keep the field in sync if the URL changes from outside (e.g. clearing
  // all filters, or the back/forward button).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInput(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-11 pr-10 text-sm shadow-sm outline-none placeholder:text-ink-400 focus:border-rust-500 focus:ring-1 focus:ring-rust-500"
      />
      {input && (
        <button
          type="button"
          onClick={() => setInput("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
