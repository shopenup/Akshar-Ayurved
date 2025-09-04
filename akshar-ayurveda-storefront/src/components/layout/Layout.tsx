import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import BackToTop from '../ui/BackToTop';

interface LayoutProps {
  children: React.ReactNode;
  cartItemCount?: number;
  favouriteCount?: number;
  isLoggedIn?: boolean;
  updateCartCount?: (count: number) => void;
  setLoggedIn?: (loggedIn: boolean) => void;
  resetAppState?: () => void;
}

export default function Layout({ 
  children, 
  cartItemCount = 0, 
  favouriteCount = 0, 
  isLoggedIn = false,
  updateCartCount,
  setLoggedIn,
  resetAppState
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation 
        cartItemCount={cartItemCount}
        favouriteCount={favouriteCount}
        isLoggedIn={isLoggedIn}
        updateCartCount={updateCartCount}
        setLoggedIn={setLoggedIn}
        resetAppState={resetAppState}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
