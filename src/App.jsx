import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './Pages/Login';
import HomePage from './Pages/HomePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { access, loading } = useSelector((state) => state.account);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if tokens exist in localStorage on app load
    const storedAccess = localStorage.getItem('access');
    const storedRefresh = localStorage.getItem('refresh');
    
    if (storedAccess && storedRefresh && !access) {
      // Restore tokens to Redux state
      dispatch({ 
        type: 'account/restoreTokens', 
        payload: { 
          access: storedAccess, 
          refresh: storedRefresh 
        } 
      });
    }
  }, [access, dispatch]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const isAuthenticated = access || localStorage.getItem('access');

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (for login page - redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { access } = useSelector((state) => state.account);
  
  // Check localStorage as well in case Redux state is not yet hydrated
  const isAuthenticated = access || localStorage.getItem('access');
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Route - Home Page */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public Route - Login Page */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;