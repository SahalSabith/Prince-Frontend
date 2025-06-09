import React, { useEffect } from 'react';
import { Plus, Grid3X3 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../Redux/productSlice';

const CategoryNav = ({ 
  selectedCategory, 
  onCategorySelect, 
  onAddDishClick,
}) => {
  const dispatch = useDispatch();
  const { categories, dishes, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch])

  // Calculate total items count for "All" category
  const totalItemsCount = dishes ? dishes.length : 0;

  const CategoryIcon = ({ category, isSelected }) => {
    return (
      <div className={`rounded-2xl w-14 h-14 flex items-center justify-center text-2xl transition-all duration-200 ${
        isSelected 
          ? "bg-blue-500 text-white shadow-lg" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}>
        {category.icon}
      </div>
    );
  };

  return (
    <div className="w-full mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {/* All Category - Default */}
        <div 
          onClick={() => onCategorySelect('All Menu')}
          className={`flex flex-col items-center min-w-[88px] p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
            selectedCategory === 'All Menu' 
              ? "bg-blue-50 border-2 border-blue-200 shadow-sm" 
              : "bg-white border-2 border-transparent hover:bg-gray-50 shadow-sm"
          }`}
        >
          <CategoryIcon 
            category={{ icon: <Grid3X3 size={24} /> }} 
            isSelected={selectedCategory === 'All Menu'}
          />
          <div className="mt-3 text-center">
            <p className={`text-sm font-semibold ${
              selectedCategory === 'All Menu' ? 'text-blue-700' : 'text-gray-800'
            }`}>
              All Menu
            </p>
            <p className="text-xs text-gray-500 mt-1">{totalItemsCount} Items</p>
          </div>
        </div>

        {/* Dynamic Categories */}
        {categories.map((category) => (
          <div 
            key={category.id}
            onClick={() => onCategorySelect(category.name)}
            className={`flex flex-col items-center min-w-[88px] p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
              selectedCategory === category.name 
                ? "bg-blue-50 border-2 border-blue-200 shadow-sm" 
                : "bg-white border-2 border-transparent hover:bg-gray-50 shadow-sm"
            }`}
          >
            <CategoryIcon 
              category={category} 
              isSelected={selectedCategory === category.name}
            />
            <div className="mt-3 text-center">
              <p className={`text-sm font-semibold ${
                selectedCategory === category.name ? 'text-blue-700' : 'text-gray-800'
              }`}>
                {category.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{category.count} Items</p>
            </div>
          </div>
        ))}
        
        {/* Add Dish Button */}
        {onAddDishClick && (
          <div 
            onClick={onAddDishClick}
            className="flex flex-col items-center justify-center min-w-[88px] p-4 rounded-2xl cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 group shadow-sm"
          >
            <div className="rounded-2xl w-14 h-14 flex items-center justify-center bg-green-500 text-white group-hover:bg-green-600 transition-colors">
              <Plus size={24} />
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-green-700">Add Dish</p>
              <p className="text-xs text-green-600 mt-1">New Item</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryNav;