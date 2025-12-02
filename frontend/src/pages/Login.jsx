// Login page component
// Two-panel layout matching Signup design, with Framer Motion animation

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../utils/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* Container with same style as Signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* LEFT PANEL - Intro for new users */}
        <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 text-white p-10 flex flex-col justify-between">
          {/* Decorative shapes */}
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-yellow-400 opacity-40 rounded-full -translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-10 right-10 w-20 h-20 bg-white opacity-10 rounded-lg rotate-45"></div>

          <div>
            {/* Brand */}
            <div className="flex items-center gap-3 mb-10">
              <h1 className="text-2xl font-semibold tracking-wide">DotChat</h1>
            </div>

            <h2 className="text-4xl font-bold mb-4">New to DotChat?</h2>
            <p className="text-white/90 max-w-xs leading-relaxed">
              Create a free account and start real-time conversations with your
              friends, classmates, or team in seconds.
            </p>
          </div>

          <Link
            to="/signup"
            className="mt-8 inline-block px-8 py-3 rounded-full border border-white text-white font-medium hover:bg-white hover:text-teal-600 transition"
          >
            SIGN UP
          </Link>
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-teal-600 mb-4">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-6 text-sm">
            Log in to continue your chats on DotChat.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white py-2 rounded-full font-medium hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          {/* Signup link (extra, but matches flow) */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-teal-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
