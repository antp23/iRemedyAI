import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({
  isAuthenticated = false,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
