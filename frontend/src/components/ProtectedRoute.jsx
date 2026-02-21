import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ruta que requiere estar autenticado
export function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Cargando...</div>;
    return user ? children : <Navigate to="/login" replace />;
}

// Ruta que requiere ser admin
export function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return <div className="loading">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/products" replace />;
    return children;
}
