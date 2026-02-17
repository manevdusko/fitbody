import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if this is a dynamic route that should be handled by Next.js
    const path = router.asPath;
    
    // List of dynamic routes that should be checked
    const dynamicRoutes = [
      /^\/products\/[^/]+\/?$/,  // /products/[slug]
      /^\/blog\/[^/]+\/?$/,       // /blog/[slug]
    ];

    // Check if the current path matches any dynamic route pattern
    const isDynamicRoute = dynamicRoutes.some(pattern => pattern.test(path));

    if (isDynamicRoute) {
      console.log('404 page: Detected dynamic route, forcing router reload:', path);
      // Force a client-side navigation to the same path
      // This will trigger the dynamic page component instead of 404
      router.replace(path).then(() => {
        console.log('404 page: Router replaced successfully');
      }).catch((err) => {
        console.error('404 page: Router replace failed:', err);
        setIsChecking(false);
      });
    } else {
      // Not a dynamic route, show 404 page
      setIsChecking(false);
    }
  }, [router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-lg">Се вчитува...</div>
        </div>
      </div>
    );
  }

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