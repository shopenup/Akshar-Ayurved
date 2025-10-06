import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthHeaders } from '@lib/shopenup/cookies';
import { getCustomer } from '@lib/shopenup/customer';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  // Check authentication status on mount and when needed
  const checkAuthStatus = async () => {
    try {
      const headers = await getAuthHeaders();
      if ('authorization' in headers && headers.authorization) {
        // Check if the token is valid by trying to get customer data
        console.log("this")
        const customer = await getCustomer();
        console.log("this")

        if (customer) {
          setIsLoggedIn(true);
          
          // Sync cart when user is authenticated
          try {
            const { syncCartOnLogin } = await import('@lib/shopenup/cart-sync');
            const cartSyncResult = await syncCartOnLogin();
            if (cartSyncResult.success) {
              // Invalidate cart queries to trigger refetch and update cart count
              await queryClient.invalidateQueries({ queryKey: ["cart"] });
            }
          } catch (error) {
            console.warn('⚠️ Cart sync failed on auth check:', error);
          }
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

  const resetAppState = async () => {
    setCartItemCount(0);
    setFavouriteCount(0);
    setIsLoggedIn(false);
    
    // Clear cart data on logout
    try {
      const { clearCartOnLogout } = await import('@lib/shopenup/cart-sync');
      await clearCartOnLogout();
    } catch (error) {
      console.warn('⚠️ Failed to clear cart on logout:', error);
    }
    
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
