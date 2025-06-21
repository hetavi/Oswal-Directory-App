// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import TopNavBar from './components/TopNavBar';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/Routes';
import LoadingSpinner from './components/LoadingSpinner';

const App = () => {
  const { loading } = useAuth();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-white">
            <TopNavBar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <AppRoutes />
              )}
            </main>
          </div>
        </NotificationProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;