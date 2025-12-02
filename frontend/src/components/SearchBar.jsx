// Search bar component
// Simple search input with icon, styled for DotChat theme

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none text-sm"
      />
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

export default SearchBar;

