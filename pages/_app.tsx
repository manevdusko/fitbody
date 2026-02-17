import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import RouteHandler from '@/components/RouteHandler';
import { NotificationProvider } from '@/components/Notifications/NotificationSystem';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import LoadingScreen from '@/components/LoadingScreen';
import { usePageLoading } from '@/hooks/usePageLoading';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  const { loading, progress } = usePageLoading();

  // Prevent body scroll when loading
  useEffect(() => {
    if (loading) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }
  }, [loading]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <NotificationProvider>
            <AuthProvider>
              <CartProvider>
                {loading && <LoadingScreen progress={progress} />}
                <RouteHandler />
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </CartProvider>
            </AuthProvider>
          </NotificationProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}