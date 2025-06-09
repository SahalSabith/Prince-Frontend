import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { login,signup } from '../Redux/authSlice';

const Login = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: ['', '', '', '']
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handlePasswordChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPassword = [...formData.password];
      newPassword[index] = value;
      setFormData({ ...formData, password: newPassword });
      
      // Auto focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !formData.password[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, mobile, password } = formData;

    // Validation
    if (!isLogin && !name.trim()) {
      showToast('Please enter your name');
      return;
    }

    if (!mobile.trim()) {
      showToast('Please enter your phone number');
      return;
    }

    if (mobile.length < 10) {
      showToast('Please enter a valid phone number');
      return;
    }

    const passwordStr = password.join('');
    if (passwordStr.length !== 4) {
      showToast('Please enter a 4-digit password');
      return;
    }

    const passwordInt = parseInt(passwordStr);

    if (isLogin) {
      dispatch(login({ mobile, password: passwordInt }))
        .unwrap()
        .then(() => {
          showToast('Login successful!', 'success');
          navigate('/')
        })
        .catch((err) => {
          showToast(`Login failed: ${err.error}`, 'error');
        });
    } else {
      dispatch(signup({ name, mobile, password: passwordInt }))
        .unwrap()
        .then(() => {
          showToast('Account created successfully!', 'success');
          navigate('/')
        })
        .catch((err) => {
          showToast(`Registration failed: ${err.mobile}`, 'error');
          
        });
    }
  };


  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      mobile: '',
      password: ['', '', '', '']
    });
  };

  const resetPassword = () => {
    setFormData({ ...formData, password: ['', '', '', ''] });
    document.getElementById('pin-0')?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    {/* Toast Notification */}
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        toast.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
        <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
        {toast.message}
        </div>
    </div>

    <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
            Prince
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        {/* Toggle Buttons */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-8">
            <button
            onClick={() => !isLogin && toggleForm()}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                isLogin 
                ? 'bg-white text-purple-900 shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
            >
            Login
            </button>
            <button
            onClick={() => isLogin && toggleForm()}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                !isLogin 
                ? 'bg-white text-purple-900 shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
            >
            Sign Up
            </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
            {/* Name Field (Sign Up Only) */}
            <div className={`transition-all duration-500 overflow-hidden ${
            isLogin ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
            }`}>
            <div className="pb-6">
                <label className="block text-white/80 text-sm font-medium mb-2">
                Full Name
                </label>
                <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
                />
            </div>
            </div>

            {/* Phone Field */}
            <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
                Phone Number
            </label>
            <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                placeholder="Enter your phone number"
            />
            </div>

            {/* Password Field (PIN Style) */}
            <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-white/80 text-sm font-medium">
                Password (4 digits)
                </label>
                <button
                type="button"
                onClick={resetPassword}
                className="text-purple-300 text-sm hover:text-purple-200 transition-colors"
                >
                Clear
                </button>
            </div>
            <div className="flex justify-center space-x-4">
                {formData.password.map((digit, index) => (
                <input
                    key={index}
                    id={`pin-${index}`}
                    type="password"
                    value={digit}
                    onChange={(e) => handlePasswordChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-14 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    maxLength={1}
                />
                ))}
            </div>
            </div>

            {/* Submit Button */}
            <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
            {isLogin ? 'Login' : 'Create Account'}
            </button>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6">
            <p className="text-white/60 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
                onClick={toggleForm}
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
            >
                {isLogin ? 'Sign up here' : 'Login here'}
            </button>
            </p>
        </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
        <p className="text-white/40 text-xs">
            Secure • Fast • Modern
        </p>
        </div>
    </div>
    </div>

  )
};

export default Login;