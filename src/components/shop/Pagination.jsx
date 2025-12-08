import React from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";

export default function Pagination({ totalPages, currentPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const setPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const pagesToShow = 3;
  const startPage = Math.max(1, currentPage);
  const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  const renderPageNumbers = () => {
    const pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={clsx(
            "w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium",
            {
              "bg-black text-white": currentPage === i,
              "bg-gray-100 text-black hover:bg-gray-200": currentPage !== i,
            }
          )}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center mt-8 gap-2">
      <button
        onClick={() => currentPage > 1 && setPage(currentPage - 1)}
        className="text-xl px-2 text-gray-600 hover:text-black"
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {renderPageNumbers()}
      {totalPages > endPage && <span className="text-gray-500">...</span>}
      {totalPages > endPage && (
        <button
          onClick={() => setPage(totalPages)}
          className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
        >
          {totalPages}
        </button>
      )}
      <button
        onClick={() => currentPage < totalPages && setPage(currentPage + 1)}
        className="text-xl px-2 text-gray-600 hover:text-black"
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
}