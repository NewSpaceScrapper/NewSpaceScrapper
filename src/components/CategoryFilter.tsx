
import React from 'react';
import { Filter, X } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  categoryStats: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  categoryStats
}) => {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onCategoryChange([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Filter size={20} />
          Filter by Categories
        </h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors duration-200"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const isSelected = selectedCategories.includes(category);
          const count = categoryStats[category] || 0;
          
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span>{category}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isSelected 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Active filters: {selectedCategories.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
