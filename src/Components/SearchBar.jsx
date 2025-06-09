import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, searchQuery }) => {
  return (
    <div className="w-full mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search something sweet on your mind..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full py-3 px-4 pl-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
};

export default SearchBar;