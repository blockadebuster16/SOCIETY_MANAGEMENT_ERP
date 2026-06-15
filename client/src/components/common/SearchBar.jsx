import React, { useState } from 'react';

export function SearchBar({ placeholder = 'Search records...', onSearch, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full max-w-md gap-2">
      <div className="relative flex-grow">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-3 pr-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-society-primary/25 focus:border-society-primary dark:focus:border-society-secondary transition-all duration-150 text-slate-700 dark:text-slate-200 transition-theme"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="bg-society-primary hover:bg-[#0b213b] text-white dark:text-slate-100 font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
