import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showDealerSection?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showDealerSection }) => {
  const router = useRouter();
  
  // Show dealer section on home page by default, or when explicitly requested
  const shouldShowDealerSection = showDealerSection !== undefined 
    ? showDealerSection 
    : router.pathname === '/';

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-14 sm:pt-16">
        {children}
      </main>
      <Footer showDealerSection={shouldShowDealerSection} />
    </div>
  );
};

export default Layout;