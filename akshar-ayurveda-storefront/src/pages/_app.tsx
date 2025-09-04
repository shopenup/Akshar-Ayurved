import type { AppProps } from 'next/app';
import Layout from '../components/layout/Layout';
import { AppProvider, useAppContext } from '../context/AppContext';
import { ReactQueryProvider } from '../lib/util/react-query';
import { ToastProvider } from '../components/ui';
import '../styles/globals.css';

function AppContent({ Component, pageProps }: AppProps) {
  const { cartItemCount, favouriteCount, isLoggedIn, updateCartCount, setLoggedIn, resetAppState } = useAppContext();

  return (
    <Layout 
      cartItemCount={cartItemCount}
      favouriteCount={favouriteCount}
      isLoggedIn={isLoggedIn}
      updateCartCount={updateCartCount}
      setLoggedIn={setLoggedIn}
      resetAppState={resetAppState}
    >
      <Component {...pageProps} />
    </Layout>
  );
}

export default function App(props: AppProps) {
  return (
    <ReactQueryProvider>
      <AppProvider>
        <ToastProvider>
          <AppContent {...props} />
        </ToastProvider>
      </AppProvider>
    </ReactQueryProvider>
  );
}
