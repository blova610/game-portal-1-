"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-[#16213e] border-slate-700 text-slate-300 hover:bg-slate-700/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className={
            currentPage === page
              ? "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
              : "bg-[#16213e] border-slate-700 text-slate-300 hover:bg-slate-700/50"
          }
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-[#16213e] border-slate-700 text-slate-300 hover:bg-slate-700/50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
