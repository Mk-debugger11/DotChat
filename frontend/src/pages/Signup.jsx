import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../utils/api';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
      const data = await authAPI.register(username, email, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >

        {/* LEFT PANEL */}
        <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 text-white p-10 flex flex-col justify-between">
          {/* Decorative shapes */}
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-yellow-400 opacity-40 rounded-full -translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-10 right-10 w-20 h-20 bg-white opacity-10 rounded-lg rotate-45"></div>

          <div>
            {/* Brand */}
            <div className="flex items-center gap-3 mb-10">
              <h1 className="text-2xl font-semibold tracking-wide">DotChat</h1>
            </div>

            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>

            <p className="text-white/90 max-w-xs leading-relaxed">
              Stay connected with your chats, conversations and friends.  
              Log in anytime and jump right back into the conversation.
            </p>
          </div>

          <Link
            to="/login"
            className="mt-8 inline-block px-8 py-3 rounded-full border border-white text-white font-medium hover:bg-white hover:text-teal-600 transition"
          >
            SIGN IN
          </Link>
        </div>

        {/* RIGHT PANEL - SIGNUP */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-teal-600 mb-4">
            Create Account
          </h2>

          <p className="text-gray-500 mb-6 text-sm">
            Use your email to start chatting on DotChat.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none border-gray-300 focus:ring-2 focus:ring-teal-500"
                placeholder="Enter username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none border-gray-300 focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none border-gray-300 focus:ring-2 focus:ring-teal-500"
                placeholder="Create a password"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white py-2 rounded-full font-medium hover:bg-teal-600 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'SIGN UP'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
