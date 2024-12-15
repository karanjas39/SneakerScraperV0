"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/app/lib/hooks/use-debounce";

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 500);

  React.useEffect(() => {
    if (debouncedInput.length >= 3) {
      onSearch(debouncedInput);
    }
  }, [debouncedInput, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Search for sneakers..."
          className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {debouncedInput.length > 0 && input.length < 3 ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}
