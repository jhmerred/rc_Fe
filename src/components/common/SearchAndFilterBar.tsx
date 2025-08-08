"use client";

import { ReactNode } from "react";

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  searchPlaceholder: string;
  filterActive: boolean | undefined;
  onFilterActiveChange: (value: boolean | undefined) => void;
  createButtonText: string;
  onCreateClick: () => void;
  createButtonIcon?: ReactNode;
}

export default function SearchAndFilterBar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  filterActive,
  onFilterActiveChange,
  createButtonText,
  onCreateClick,
  createButtonIcon,
}: SearchAndFilterBarProps) {
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterActiveChange(value === "" ? undefined : value === "true");
  };

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <form onSubmit={onSearchSubmit} className="flex flex-1 gap-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <select
          value={filterActive === undefined ? "" : filterActive.toString()}
          onChange={handleFilterChange}
          className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">모든 상태</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:text-sm"
        >
          검색
        </button>
      </form>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center rounded-md border border-transparent bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {createButtonIcon && (
          <span className="-ml-1 mr-2">{createButtonIcon}</span>
        )}
        {createButtonText}
      </button>
    </div>
  );
}
