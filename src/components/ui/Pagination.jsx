import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ current, total, onPageChange, pageSize = 20 }) => {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-8 no-print">
      <button
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        className={`p-2 border-2 transition-all ${current === 1 ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 cursor-not-allowed' : 'border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary hover:text-primary'}`}
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center space-x-2">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 text-[10px] font-bold border-2 transition-all ${current === page ? 'bg-primary border-primary text-white shadow-lg' : 'border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary'}`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        disabled={current === totalPages}
        onClick={() => onPageChange(current + 1)}
        className={`p-2 border-2 transition-all ${current === totalPages ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 cursor-not-allowed' : 'border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary hover:text-primary'}`}
      >
        <ChevronRight size={16} />
      </button>
      
      <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-4 italic opacity-50">
        Total: {total} Registros
      </span>
    </div>
  );
};

export default Pagination;
