import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, fetchCategories, createDish, clearProductState } from '../Redux/productSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddDishPage = ({ onBackClick, categories: initialCategories = [] }) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const dispatch = useDispatch();
  const { categories, loading, error, success } = useSelector((state) => state.product);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Form states
  const [dishForm, setDishForm] = useState({
    dish_name: '',
    price: '',
    category: '',
    description: '',
    image: null,
    imagePreview: null
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: ''
  });

  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dishCreationSuccess, setDishCreationSuccess] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    console.log('Component mounted, fetching categories...');
    dispatch(fetchCategories());
    dispatch(clearProductState());
  }, [dispatch]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('State changed:', { success, error, loading, isSubmitting });
  }, [success, error, loading, isSubmitting]);

  // Handle success/error states - Fixed logic
  useEffect(() => {
    // Only handle dish creation success when we're actually submitting a dish
    if (success && isSubmitting && !loading) {
      console.log('Dish creation successful!');
      
      toast.success('🎉 Dish added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Wait a bit before clearing form to ensure toast is visible
      setTimeout(() => {
        // Reset form
        setDishForm({
          dish_name: '',
          price: '',
          category: '',
          description: '',
          image: null,
          imagePreview: null
        });

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Clear form errors and states
        setFormErrors({});
        setIsSubmitting(false);
        setDishCreationSuccess(true);

        // Navigate after showing success message
        setTimeout(() => {
          dispatch(clearProductState());
          if (onBackClick) {
            onBackClick();
          } else {
            navigate('/');
          }
        }, 1500);
      }, 500);
    }

    // Handle errors only when submitting
    if (error && isSubmitting && !loading) {
      console.log('Dish creation error:', error);
      setIsSubmitting(false);
      
      let errorMessage = 'Failed to add dish. Please try again.';
      
      // Handle different error formats
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = error.detail;
      } else if (error?.non_field_errors && Array.isArray(error.non_field_errors)) {
        errorMessage = error.non_field_errors[0];
      } else if (error?.dish_name && Array.isArray(error.dish_name)) {
        errorMessage = `Dish Name: ${error.dish_name[0]}`;
      } else if (error?.price && Array.isArray(error.price)) {
        errorMessage = `Price: ${error.price[0]}`;
      } else if (error?.category_id && Array.isArray(error.category_id)) {
        errorMessage = `Category: ${error.category_id[0]}`;
      } else if (error?.dish_image && Array.isArray(error.dish_image)) {
        errorMessage = `Image: ${error.dish_image[0]}`;
      } else if (typeof error === 'object') {
        // Try to extract first error message from object
        const firstErrorKey = Object.keys(error)[0];
        if (firstErrorKey && error[firstErrorKey]) {
          if (Array.isArray(error[firstErrorKey])) {
            errorMessage = `${firstErrorKey}: ${error[firstErrorKey][0]}`;
          } else {
            errorMessage = `${firstErrorKey}: ${error[firstErrorKey]}`;
          }
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [success, error, loading, isSubmitting, navigate, onBackClick, dispatch]);

  // Validation functions
  const validateDishName = (name) => {
    if (!name || !name.trim()) return 'Dish name is required';
    if (name.trim().length < 2) return 'Dish name must be at least 2 characters';
    if (name.trim().length > 100) return 'Dish name cannot exceed 100 characters';
    return '';
  };

  const validatePrice = (price) => {
    if (!price || price.toString().trim() === '') return 'Price is required';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Please enter a valid number';
    if (numPrice <= 0) return 'Price must be greater than 0';
    if (numPrice > 10000) return 'Price cannot exceed $10,000';
    return '';
  };

  const validateCategory = (category) => {
    if (!category || category === '') return 'Please select a category';
    return '';
  };

  const validateDescription = (description) => {
    if (description && description.length > 500) return 'Description cannot exceed 500 characters';
    return '';
  };

  // Made image validation mandatory
  const validateImage = (image) => {
    if (!image) return 'Please select an image for the dish';
    if (image.size > 5 * 1024 * 1024) return 'Image size should be less than 5MB';
    if (!image.type.startsWith('image/')) return 'Please select a valid image file';
    return '';
  };

  // Real-time validation with better error handling
  const handleInputChange = (field, value) => {
    setDishForm(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time validation
    let error = '';
    switch (field) {
      case 'dish_name':
        error = validateDishName(value);
        break;
      case 'price':
        error = validatePrice(value);
        break;
      case 'category':
        error = validateCategory(value);
        break;
      case 'description':
        error = validateDescription(value);
        break;
      default:
        break;
    }

    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageError = validateImage(file);
      if (imageError) {
        toast.error(imageError);
        setFormErrors(prev => ({ ...prev, image: imageError }));
        return;
      }

      // Clear image error
      setFormErrors(prev => ({ ...prev, image: '' }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setDishForm(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddCategory = async () => {
    // Validate category form
    const categoryErrors = {};
    
    if (!categoryForm.name.trim()) {
      categoryErrors.name = 'Category name is required';
    } else if (categoryForm.name.trim().length < 2) {
      categoryErrors.name = 'Category name must be at least 2 characters';
    }
    
    if (!categoryForm.icon) {
      categoryErrors.icon = 'Please select an icon';
    }

    if (Object.keys(categoryErrors).length > 0) {
      const firstError = Object.values(categoryErrors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const result = await dispatch(createCategory({
        name: categoryForm.name.trim(),
        icon: categoryForm.icon
      }));
      
      if (createCategory.fulfilled.match(result)) {
        const newCategoryId = result.payload?.id;
        if (newCategoryId) {
          setDishForm(prev => ({ ...prev, category: newCategoryId.toString() }));
          // Clear category validation error if it exists
          setFormErrors(prev => ({ ...prev, category: '' }));
        }
        setCategoryForm({ name: '', icon: '' });
        setShowCategoryModal(false);
        toast.success('✅ Category added successfully!');
        
        // Refresh categories list
        dispatch(fetchCategories());
      } else {
        throw new Error(result.error?.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Category creation error:', error);
      toast.error('Failed to add category. Please try again.');
    }
  };

  const handleAddDish = async () => {
    // Prevent double submission
    if (isSubmitting || loading) {
      console.log('Already submitting, please wait...');
      return;
    }

    console.log('Starting dish validation...');

    // Validate all fields including mandatory image
    const errors = {};
    errors.dish_name = validateDishName(dishForm.dish_name);
    errors.price = validatePrice(dishForm.price);
    errors.category = validateCategory(dishForm.category);
    errors.description = validateDescription(dishForm.description);
    errors.image = validateImage(dishForm.image); // Now mandatory

    // Remove empty errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setFormErrors(errors);

    // If there are validation errors, show the first one and stop
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      console.log('Validation error:', firstError);
      toast.error(firstError, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    console.log('Validation passed, starting submission...');
    setIsSubmitting(true);
    
    // Clear any previous states
    dispatch(clearProductState());

    try {
      // Create FormData for proper file upload
      const formData = new FormData();
      formData.append('dish_name', dishForm.dish_name.trim());
      formData.append('price', parseFloat(dishForm.price).toFixed(2));
      formData.append('category_id', parseInt(dishForm.category));
      
      if (dishForm.description.trim()) {
        formData.append('description', dishForm.description.trim());
      }
      
      // Image is now mandatory
      if (dishForm.image) {
        formData.append('dish_image', dishForm.image);
      }

      // Log the form data for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log('Dispatching createDish action...');
      const result = await dispatch(createDish(formData));
      
      console.log('Dispatch result:', result);

      if (!createDish.fulfilled.match(result)) {
        console.log('Dish creation failed:', result.payload || result.error);
        throw new Error(result.error?.message || result.payload?.message || 'Failed to create dish');
      }

      console.log('Dish creation successful!');
      // Success will be handled by useEffect

    } catch (error) {
      console.error('Dish creation error:', error);
      setIsSubmitting(false);
      
      let errorMessage = 'Failed to add dish. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.status) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid dish data. Please check all fields.';
            break;
          case 401:
            errorMessage = 'You are not authorized. Please login again.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission.';
            break;
          case 413:
            errorMessage = 'Image file is too large. Please choose a smaller image.';
            break;
          case 422:
            errorMessage = 'Invalid data format. Please check your inputs.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server error (${error.response.status}). Please try again.`;
        }
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const CategoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add Category</h2>
          <button
            onClick={() => {
              setShowCategoryModal(false);
              setCategoryForm({ name: '', icon: '' });
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
              maxLength="50"
              autoFocus
            />
            {categoryForm.name.length > 0 && categoryForm.name.length < 2 && (
              <p className="text-red-500 text-xs mt-1">Category name must be at least 2 characters</p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Icon <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-6 gap-3">
              {['🍕', '🍔', '🍟', '🥗', '🍰', '☕', '🥤', '🍜', '🍣', '🌮', '🥙', '🍿'].map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, icon })}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all duration-200 ${categoryForm.icon === icon
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
            type="button"
            onClick={handleAddCategory}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Category...' : 'Add Category'}
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
          {/* Image Upload - Now Required */}
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={handleImageClick}
              className={`w-32 h-32 mx-auto bg-gray-100 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${
                formErrors.image ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {dishForm.imagePreview ? (
                <img
                  src={dishForm.imagePreview}
                  alt="Dish preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload Photo</p>
                  <p className="text-xs text-red-500 mt-1">Required *</p>
                </div>
              )}
            </div>
            {formErrors.image && (
              <p className="text-red-500 text-xs mt-2">{formErrors.image}</p>
            )}
          </div>

          {/* Dish Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dishForm.dish_name}
              onChange={(e) => handleInputChange('dish_name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.dish_name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter dish name"
              maxLength="100"
            />
            {formErrors.dish_name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.dish_name}</p>
            )}
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
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.price ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
                max="10000"
              />
            </div>
            {formErrors.price && (
              <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
            )}
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
                    handleInputChange('category', e.target.value);
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer ${
                  formErrors.category ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select category</option>
                <option value="add_new" className="text-blue-600 font-medium">
                  + Add New Category
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
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
            {formErrors.category && (
              <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
              <span className="text-gray-400 text-xs ml-2">
                ({dishForm.description.length}/500)
              </span>
            </label>
            <textarea
              value={dishForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                formErrors.description ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter dish description (optional)"
              rows={3}
              maxLength="500"
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
            )}
            {dishForm.description.length > 450 && !formErrors.description && (
              <p className="text-orange-500 text-xs mt-1">
                {500 - dishForm.description.length} characters remaining
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddDish}
            disabled={loading || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isSubmitting ? 'Adding Dish...' : 'Add Dish'}
          </button>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && <CategoryModal />}
    </div>
  );
};

export default AddDishPage;