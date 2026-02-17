import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const RouteHandler: React.FC = () => {
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for router to be ready and only check once
    if (!router.isReady || hasChecked) return;

    // Get the path from WordPress injection OR directly from browser URL
    let initialPath = '';
    
    if (typeof window !== 'undefined') {
      // Try WordPress injected path first
      if ((window as any).INITIAL_PATH) {
        initialPath = (window as any).INITIAL_PATH;
      } else {
        // Fallback: read directly from browser URL
        initialPath = window.location.pathname;
      }
      
      const currentPath = router.asPath;
      
      console.log('RouteHandler - Initial Path:', initialPath);
      console.log('RouteHandler - Current Path:', currentPath);
      console.log('RouteHandler - Browser URL:', window.location.pathname);
      console.log('RouteHandler - Router pathname:', router.pathname);
      
      // Check if we're on a dynamic route but showing wrong content
      // This happens when Next.js static export doesn't have the page pre-rendered
      if (initialPath && initialPath !== '/' && initialPath === currentPath) {
        // Paths match but we might be showing wrong content
        // Check if we're on a product page
        if (initialPath.startsWith('/products/') && router.pathname === '/') {
          console.log('RouteHandler - Product page detected but showing home, forcing reload');
          // Force a client-side navigation to trigger the page component
          router.replace(initialPath, undefined, { shallow: false });
        }
      } else if (initialPath && initialPath !== '/' && initialPath !== currentPath) {
        console.log('RouteHandler - Navigating to:', initialPath);
        router.replace(initialPath);
      }
    }
    
    setHasChecked(true);
  }, [router.isReady, router.asPath, hasChecked, router.pathname]);

  return null; // This component doesn't render anything
};

export default RouteHandler;