import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthHeaders } from '@lib/shopenup/cookies';
import { getCustomer } from '@lib/shopenup/customer';

interface AppContextType {
  cartItemCount: number;
  favouriteCount: number;
  isLoggedIn: boolean;
  isLoading: boolean;
  updateCartCount: (count: number) => void;
  updateFavouriteCount: (count: number) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  resetAppState: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and when needed
  const checkAuthStatus = async () => {
    try {
      const headers = await getAuthHeaders();
      if ('authorization' in headers && headers.authorization) {
        // Check if the token is valid by trying to get customer data
        const customer = await getCustomer();
        if (customer) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const updateCartCount = (count: number) => {
    setCartItemCount(count);
  };

  const updateFavouriteCount = (count: number) => {
    setFavouriteCount(count);
  };

  const setLoggedIn = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
  };

  const resetAppState = () => {
    setCartItemCount(0);
    setFavouriteCount(0);
    setIsLoggedIn(false);
    console.log('🔄 App state reset - user logged out');
  };

  const value = {
    cartItemCount,
    favouriteCount,
    isLoggedIn,
    isLoading,
    updateCartCount,
    updateFavouriteCount,
    setLoggedIn,
    resetAppState,
    checkAuthStatus,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
