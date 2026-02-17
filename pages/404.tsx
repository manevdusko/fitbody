import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>404 - Страницата не е пронајдена | FitBody.mk</title>
        <meta name="description" content="Страницата што ја барате не постои." />
      </Head>
      
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-8xl font-bold text-orange-500 mb-4">404</h1>
            
            <h2 className="text-3xl font-semibold mb-4">
              Страницата не е пронајдена
            </h2>
            
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
              Страницата што ја барате не постои или е преместена. 
              Можеби сакате да се вратите на почетната страница?
            </p>
            
            <div className="space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg transition-colors font-semibold"
              >
                Назад
              </motion.button>
              
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg transition-colors font-semibold"
                >
                  Почетна страница
                </motion.button>
              </Link>
            </div>
            
            <div className="mt-12">
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-brandGold hover:text-orange-300 underline transition-colors"
                >
                  Разгледај ги нашите производи
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;