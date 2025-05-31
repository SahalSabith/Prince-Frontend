import React, { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';

const AddDishPage = ({ onBackClick, categories: initialCategories = [] }) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Categories state - you can pass this from parent or manage locally
  const [categories, setCategories] = useState([
    { id: 1, name: 'Breads', icon: '🍞', count: 20 },
    { id: 2, name: 'Cakes', icon: '🎂', count: 20 },
    { id: 3, name: 'Donuts', icon: '🍩', count: 20 },
    { id: 4, name: 'Pastries', icon: '🥐', count: 20 },
    { id: 5, name: 'Sandwich', icon: '🥪', count: 20 },
    ...initialCategories
  ]);

  // Form states
  const [dishForm, setDishForm] = useState({
    name: '',
    price: '',
    category: '',
    image: null
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: ''
  });

  const handleAddCategory = () => {
    if (categoryForm.name && categoryForm.icon) {
      const newCategory = {
        id: categories.length + 1,
        name: categoryForm.name,
        icon: categoryForm.icon,
        count: 0
      };
      setCategories([...categories, newCategory]);
      setDishForm({...dishForm, category: categoryForm.name});
      setCategoryForm({name: '', icon: ''});
      setShowCategoryModal(false);
    }
  };

  const handleAddDish = () => {
    if (dishForm.name && dishForm.price && dishForm.category) {
      // Handle dish submission here
      console.log('Adding dish:', dishForm);
      alert('Dish added successfully!');
      // Reset form
      setDishForm({
        name: '',
        price: '',
        category: '',
        image: null
      });
    } else {
      alert('Please fill in all required fields');
    }
  };

  const CategoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Category</h2>
          <button 
            onClick={() => setShowCategoryModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Icon</label>
            <div className="grid grid-cols-6 gap-3">
              {['🍕', '🍔', '🍟', '🥗', '🍰', '☕', '🥤', '🍜', '🍣', '🌮', '🥙', '🍿'].map(icon => (
                <button
                  key={icon}
                  onClick={() => setCategoryForm({...categoryForm, icon})}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all duration-200 ${
                    categoryForm.icon === icon 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleAddCategory}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Add New Dish</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* Image Upload */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload Photo</p>
              </div>
            </div>
          </div>

          {/* Dish Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dishForm.name}
              onChange={(e) => setDishForm({...dishForm, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter dish name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={dishForm.price}
                onChange={(e) => setDishForm({...dishForm, price: e.target.value})}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={dishForm.category}
                onChange={(e) => {
                  if (e.target.value === 'add_new') {
                    setShowCategoryModal(true);
                  } else {
                    setDishForm({...dishForm, category: e.target.value});
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Select category</option>
                <option value="add_new" className="text-blue-600 font-medium">
                  + Add New Category
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleAddDish}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add Dish
          </button>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && <CategoryModal />}
    </div>
  );
};

export default AddDishPage;