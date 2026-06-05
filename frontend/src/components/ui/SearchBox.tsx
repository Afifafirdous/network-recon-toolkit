import React, { useState, KeyboardEvent } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBoxProps {
  placeholder: string;
  onSearch: (query: string) => void;
  loading?: boolean;
  initialValue?: string;
  helpText?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder,
  onSearch,
  loading = false,
  initialValue = "",
  helpText,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSearch = () => {
    const trimmed = value.trim();
    if (trimmed && !loading) onSearch(trimmed);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setValue("");
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={loading}
            className="cyber-input pr-8"
            autoComplete="off"
            spellCheck={false}
          />
          {value && !loading && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text-dim transition-colors"
              aria-label="Clear input"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={!value.trim() || loading}
          className="cyber-btn min-w-[44px] justify-center"
          aria-label="Search"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          <span className="hidden sm:inline">
            {loading ? "Looking up…" : "Lookup"}
          </span>
        </button>
      </div>

      {helpText && (
        <p className="mt-2 text-xs font-mono text-cyber-text-dim">{helpText}</p>
      )}
    </div>
  );
};

export default SearchBox;