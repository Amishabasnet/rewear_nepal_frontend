import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <PageButton page={1} current={currentPage} onClick={onPageChange} />
          {start > 2 && <span className="px-1 text-ink-400">…</span>}
        </>
      )}

      {pages.map((page) => (
        <PageButton key={page} page={page} current={currentPage} onClick={onPageChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-ink-400">…</span>}
          <PageButton page={totalPages} current={currentPage} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-ink-200 p-2 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({ page, current, onClick }) {
  const isActive = page === current;
  return (
    <button
      onClick={() => onClick(page)}
      className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
        isActive ? "bg-rust-500 text-white" : "text-ink-600 hover:bg-ink-50"
      }`}
    >
      {page}
    </button>
  );
}
