import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-brand">🎮</div>
            <div className="nav-links">
                <Link to="/products">Productos</Link>
                <Link to="/currency">Divisas</Link>
                {isAdmin && <Link to="/admin" className="admin-link">⚙️ Admin</Link>}
            </div>
            <div className="nav-user">
                <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                    {isAdmin ? '👑 Admin' : '👤 Usuario'}
                </span>
                <span className="username">{user.username}</span>
                <button onClick={handleLogout} className="logout-btn">Salir</button>
            </div>
        </nav>
    );
}
