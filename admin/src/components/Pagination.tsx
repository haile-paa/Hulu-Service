import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  limit,
  total,
  onChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className='flex items-center justify-between px-1 pt-4'>
      <p className='text-base-400 text-xs'>
        Showing <span className='text-base-200 font-medium'>{start}</span>–
        <span className='text-base-200 font-medium'>{end}</span> of{" "}
        <span className='text-base-200 font-medium'>{total}</span>
      </p>
      <div className='flex items-center gap-2'>
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className='text-base-300 hover:text-base-100 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg border border-white/10 p-1.5 transition-colors'
        >
          <ChevronLeft size={16} />
        </button>
        <span className='text-base-300 text-xs'>
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className='text-base-300 hover:text-base-100 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg border border-white/10 p-1.5 transition-colors'
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
