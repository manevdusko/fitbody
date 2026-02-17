import { useState, useEffect } from 'react';

/**
 * Custom hook for managing loading screen state
 * Shows loading screen for real users but not for search engine bots
 */
export const useLoadingScreen = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if it's a search engine bot
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(
      navigator.userAgent
    );

    if (!isBot) {
      // Only show loading screen for real users, not for search engines
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return loading;
};
