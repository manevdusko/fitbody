import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';

const DealerLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      router.push('/dealer/dashboard');
    } catch (err) {
      setError(t('common.incorrectCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>Логин - FitBody.mk</title>
        <meta name="description" content="Најавете се во вашиот профил за пристап до специјални цени и ексклузивни производи." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-block mb-6">
              <div className="text-3xl font-bold text-white">
                fitbody<span className="text-orange-500">.mk</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">{t('common.dealerPortal')}</h1>
            <p className="text-gray-400">{t('common.loginForSpecialPrices')}</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('common.username')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-10 text-gray-400">
                    <FiUser size={16} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder={t('common.enterUsername')}
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('common.password')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-10 text-gray-400">
                    <FiLock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder={t('common.enterPassword')}
                    style={{ paddingLeft: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loggingIn') : t('common.loginButton')}
              </motion.button>

              {/* Forgot Password */}
              <div className="text-center">
                <Link href="/dealer/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  {t('common.forgotPassword')}
                </Link>
              </div>
            </form>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400">
              {t('common.notADealer')}{' '}
              <Link href="/dealer/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {t('common.applyHere')}
              </Link>
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
          >
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-blue-400 text-2xl mb-2">40%</div>
              <div className="text-gray-300 text-sm">{t('common.discount')}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-blue-400 text-2xl mb-2">24/7</div>
              <div className="text-gray-300 text-sm">{t('common.support')}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-blue-400 text-2xl mb-2">★</div>
              <div className="text-gray-300 text-sm">{t('common.exclusive')}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DealerLoginPage;