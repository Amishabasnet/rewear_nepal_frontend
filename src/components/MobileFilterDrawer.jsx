import { useEffect } from "react";
import { X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterDrawer({ isOpen, onClose, filters, onChange, onClear, resultCount }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-80 max-w-[88vw] flex-col bg-cream-50">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4">
          <h3 className="text-lg font-semibold text-ink-900">Filters</h3>
          <button onClick={onClose} aria-label="Close filters" className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <FilterSidebar filters={filters} onChange={onChange} onClear={onClear} />
        </div>

        <div className="border-t border-ink-100 p-4">
          <button onClick={onClose} className="btn-primary">
            Show {resultCount ?? ""} results
          </button>
        </div>
      </div>
    </div>
  );
}
