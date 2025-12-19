import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../context/AuthContext';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { login, register } = useAuth();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Data State
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  // Reset error when switching tabs or closing/opening
  useEffect(() => {
    setError('');
  }, [activeTab, isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(loginData.email.trim(), loginData.password);
      // Login successful
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(registerData.email.trim(), registerData.password);
      // Registration successful
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(79.2%_0.209_151.711)] via-emerald-400 to-[oklch(79.2%_0.209_151.711)]" />

              {/* Close button */}
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <h2 className="text-white text-2xl font-bold mb-2 text-center">Welcome to Quantumverse</h2>
                <p className="text-gray-400 text-center mb-6 text-sm">Secure authentication for students</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('login')}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 rounded-md transition-all font-medium text-sm ${
                      activeTab === 'login'
                        ? 'bg-[oklch(79.2%_0.209_151.711)] text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 rounded-md transition-all font-medium text-sm ${
                      activeTab === 'register'
                        ? 'bg-[oklch(79.2%_0.209_151.711)] text-gray-900 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                {activeTab === 'login' && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-300 mb-1.5 text-sm font-medium">Email</label>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[oklch(79.2%_0.209_151.711)] focus:ring-1 focus:ring-[oklch(79.2%_0.209_151.711)] transition-colors disabled:opacity-50"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1.5 text-sm font-medium">Password</label>
                      <input
                        type="password"
                        required
                        disabled={isSubmitting}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[oklch(79.2%_0.209_151.711)] focus:ring-1 focus:ring-[oklch(79.2%_0.209_151.711)] transition-colors disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 font-semibold rounded-lg hover:bg-[oklch(82%_0.22_151.711)] transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </motion.form>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-300 mb-1.5 text-sm font-medium">Email</label>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[oklch(79.2%_0.209_151.711)] focus:ring-1 focus:ring-[oklch(79.2%_0.209_151.711)] transition-colors disabled:opacity-50"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1.5 text-sm font-medium">Password</label>
                      <input
                        type="password"
                        required
                        disabled={isSubmitting}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[oklch(79.2%_0.209_151.711)] focus:ring-1 focus:ring-[oklch(79.2%_0.209_151.711)] transition-colors disabled:opacity-50"
                        placeholder="Min 8 chars"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1.5 text-sm font-medium">Confirm Password</label>
                      <input
                        type="password"
                        required
                        disabled={isSubmitting}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[oklch(79.2%_0.209_151.711)] focus:ring-1 focus:ring-[oklch(79.2%_0.209_151.711)] transition-colors disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-[oklch(79.2%_0.209_151.711)] text-gray-900 font-semibold rounded-lg hover:bg-[oklch(82%_0.22_151.711)] transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}