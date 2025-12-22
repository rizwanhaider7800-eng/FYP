import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;