import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call WordPress API directly since this is a static export
      const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp/v2', '') || 'https://fitbody.mk/wp-json';
      
      const response = await fetch(`${wpApiUrl}/fitbody/v1/dealer/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Настана грешка');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Настана грешка. Обидете се повторно.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Заборавена лозинка - FitBody.mk</title>
        <meta name="description" content="Ресетирајте ја вашата лозинка за пристап до вашиот профил." />
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
                fitbody<span className="text-blue-500">.mk</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Заборавена лозинка</h1>
            <p className="text-gray-400">Внесете го вашиот email за да ја ресетирате лозинката</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-8"
          >
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email адреса
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 z-10 text-gray-400">
                      <FiMail size={16} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Внесете email адреса"
                      style={{ paddingLeft: '3rem' }}
                    />
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
                  {loading ? 'Се испраќа...' : 'ИСПРАТИ ЛИНК'}
                </motion.button>
              </form>
            ) : (
              /* Success Message */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <FiCheck className="text-green-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">Email испратен!</h3>
                <p className="text-gray-400">
                  Проверете го вашиот email за линк за ресетирање на лозинката.
                </p>
                <p className="text-sm text-gray-500">
                  Не го наоѓате email-от? Проверете во spam папката.
                </p>
              </div>
            )}
          </motion.div>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-8"
          >
            <Link href="/dealer/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors inline-flex items-center space-x-2">
              <FiArrowLeft size={16} />
              <span>Назад кон најава</span>
            </Link>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm">
              Проблеми со најавата?{' '}
              <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
                Контактирајте не
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;