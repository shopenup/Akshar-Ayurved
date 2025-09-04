import React, { createContext, useContext, useEffect, useState } from 'react';
import { shopenupIntegration } from './index';

interface ShopenupContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const ShopenupContext = createContext<ShopenupContextType>({
  isInitialized: false,
  isLoading: true,
  error: null,
});

export const useShopenup = () => {
  const context = useContext(ShopenupContext);
  if (!context) {
    throw new Error('useShopenup must be used within a ShopenupProvider');
  }
  return context;
};

interface ShopenupProviderProps {
  children: React.ReactNode;
}

const ShopenupProvider: React.FC<ShopenupProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await shopenupIntegration.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Shopenup'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const value: ShopenupContextType = {
    isInitialized,
    isLoading,
    error,
  };

  return (
    <ShopenupContext.Provider value={value}>
      {children}
    </ShopenupContext.Provider>
  );
};

export default ShopenupProvider;
