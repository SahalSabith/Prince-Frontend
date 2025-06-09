import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// const base_url = "https://sahalsabith.pythonanywhere.com/api/";
const base_url = "http://192.168.29.42:8000/api/";

const getAuthToken = () => {
    return localStorage.getItem('accessToken')
}

export const createCategory = createAsyncThunk(
  'product/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
        const token = getAuthToken();
        const config = {
            headers : {
                Authorization:`Bearer ${token}`,
            },
        }

        const response = await axios.post(`${base_url}create-category/`, categoryData, config);
        return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
    'product/fetchCategories',
    async (_,{rejectWithValue}) => {
        try{
            const response = await axios.get(`${base_url}categories/`);
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const createDish = createAsyncThunk(
  'product/createDish',
  async (formData, { rejectWithValue }) => {
    try {
        const token = getAuthToken();

        const config = {
            headers : {
                Authorization:`Bearer ${token}`,
            },
        }

        const response = await axios.post(`${base_url}create-dish/`, formData, config);
        return response.data;
    } catch (error) {
      console.error('Error creating dish:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDish = createAsyncThunk(
    'product/fetchDish',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base_url}dishes/`);
            
            // Handle both array and object responses
            let dishes = response.data;
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                // If response is wrapped in an object, extract the dishes array
                dishes = response.data.dishes || response.data.results || response.data.data || [];
            }
            
            // Ensure we always return an array
            if (!Array.isArray(dishes)) {
                dishes = [];
            }
            
            // Transform the data to match frontend expectations
            const transformedDishes = dishes.map(dish => ({
                id: dish.id,
                name: dish.dish_name, // Map dish_name to name
                price: parseFloat(dish.price),
                category: dish.category?.category_name || dish.category?.name || 'Uncategorized', // Extract category name
                category_id: dish.category?.id,
                dish_image: dish.dish_image,
                image_url: dish.dish_image, // Provide fallback field name
                description: dish.description || ''
            }));
            
            return transformedDishes;
        } catch (error) {
            console.error('Error fetching dishes:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
)

const getInitialAuthState = () => {
  return {
    dishes: [],
    categories: [],
    loading: false,
    error: null,
    success: false,
  };
};

const productSlice = createSlice({
  name: 'product',
  initialState: getInitialAuthState(),
  reducers: {
    clearProductState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Category cases
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Check if category already exists to avoid duplicates
        const existingCategory = state.categories.find(cat => cat.id === action.payload.id);
        if (!existingCategory) {
          state.categories.push(action.payload);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch categories cases
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Create dish cases
      .addCase(createDish.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDish.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Transform the new dish data before adding to state
        const transformedDish = {
          id: action.payload.id,
          name: action.payload.dish_name,
          price: parseFloat(action.payload.price),
          category: action.payload.category?.category_name || action.payload.category?.name || 'Uncategorized',
          category_id: action.payload.category?.id,
          dish_image: action.payload.dish_image,
          image_url: action.payload.dish_image,
          description: action.payload.description || ''
        };
        
        // Check if dish already exists to avoid duplicates
        const existingDish = state.dishes.find(dish => dish.id === transformedDish.id);
        if (!existingDish) {
          state.dishes.push(transformedDish);
        }
      })
      .addCase(createDish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch dishes cases
      .addCase(fetchDish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDish.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Replace existing dishes with fetched data (already transformed in thunk)
        state.dishes = action.payload;
      })
      .addCase(fetchDish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearProductState, clearError } = productSlice.actions;
export default productSlice.reducer;