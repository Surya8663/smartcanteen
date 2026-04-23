import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-navy">
        <div className="rounded-full border-4 border-brand/20 border-t-brand px-5 py-3 text-sm font-semibold text-brand shadow-soft">
          Loading SmartCanteen...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && user?.role && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
