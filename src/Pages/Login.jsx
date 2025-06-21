import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signupUser, loginUser } from '../Redux/Slices/AccountSlice';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignup, setIsSignup] = useState(false); // Default: login page
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(['', '', '', '']);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePasswordChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newPassword = [...password];
    newPassword[index] = value;
    setPassword(newPassword);
    if (value && index < 3) {
      document.getElementById(`pass-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userData = {
      name,
      phone,
      password: password.join(''),
    };

    try {
      const res = isSignup
        ? await dispatch(signupUser(userData)).unwrap()
        : await dispatch(loginUser({ phone, password: userData.password })).unwrap();

      // On success, redirect to home
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Prince Bakery Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 mb-2 sm:mb-4">
          Prince Bakery
        </h1>
        <div className="flex items-center justify-center gap-2 text-amber-700">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
          <span className="text-sm sm:text-base font-medium">Fresh • Delicious • Premium</span>
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 mb-6 rounded-xl">
              {error.detail || error.message || 'Something went wrong'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Phone Number</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">4-Digit PIN</label>
              <div className="flex space-x-3 sm:space-x-4 justify-center">
                {password.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pass-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePasswordChange(idx, e.target.value)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Please wait...
                </div>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="text-amber-600 hover:text-orange-600 font-semibold hover:underline transition-colors duration-200"
                onClick={() => {
                  setError(null);
                  setIsSignup(!isSignup);
                }}
              >
                {isSignup ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-8 w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-8 w-24 h-24 bg-gradient-to-br from-red-200 to-amber-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-32 right-12 w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  );
}