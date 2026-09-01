import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Routes from './routes/index';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { useAuthStore } from './store/authStore';
import { socketService } from './services/socket';
import './styles/globals.css';
import './styles/animations.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      cacheTime: 1000 * 60 * 10, 
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const hydrateAuth = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    document.documentElement.setAttribute('lang', 'en');
    hydrateAuth();
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [hydrateAuth]);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-[var(--page-bg)] text-[var(--text-color)] transition-colors duration-300">
                <Header />
                <main className="flex-1 bg-[var(--page-bg)] text-[var(--text-color)]">
                  <Routes />
                </main>
                <Footer />
              </div>
            </Router>
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
