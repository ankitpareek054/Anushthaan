import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

const Search = ({ onSearch }) => {
  const [query, setQuery] = React.useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        className="w-full pl-12 py-2 pr-10 rounded-lg bg-gray-100 text-gray-700 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
      />
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
      </div>
      {/* Clear Button (visible only when there's text) */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

export default Search;
