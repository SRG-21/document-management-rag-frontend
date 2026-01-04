import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { config } from '../../lib/config';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // In dev mode, bypass authentication
  if (config.devMode) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
