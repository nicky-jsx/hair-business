"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = "specialists",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem =
    totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  // Generate page numbers with smart ellipsis
  function getPageNumbers(): (number | string)[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`mt-8 flex flex-col items-center gap-3 border-t border-outline-variant/30 pt-6 ${className}`}
    >
      {/* Item Range Counter */}
      {totalItems !== undefined && startItem !== null && endItem !== null && (
        <p className="text-[11px] font-medium text-outline uppercase tracking-caps">
          Showing <span className="font-bold text-primary">{startItem}–{endItem}</span> of{" "}
          <span className="font-bold text-primary">{totalItems}</span> {itemName}
        </p>
      )}

      <div className="flex w-full items-center justify-between sm:justify-center sm:gap-2">
        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-caps transition-all ${
            currentPage <= 1
              ? "opacity-30 cursor-not-allowed text-outline"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-95 shadow-xs"
          }`}
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span>Prev</span>
        </button>

        {/* Mobile Page Indicator (compact) */}
        <div className="flex sm:hidden items-center text-xs font-semibold uppercase tracking-caps text-on-surface-variant">
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        {/* Desktop Numbered Page Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-outline select-none"
                >
                  …
                </span>
              );
            }

            const pageNum = page as number;
            const isSelected = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-current={isSelected ? "page" : undefined}
                aria-label={`Page ${pageNum}`}
                className={`min-w-9 h-9 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  isSelected
                    ? "bg-primary text-background font-bold shadow-xs scale-105"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-caps transition-all ${
            currentPage >= totalPages
              ? "opacity-30 cursor-not-allowed text-outline"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-95 shadow-xs"
          }`}
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </nav>
  );
}
