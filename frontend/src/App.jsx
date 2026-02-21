import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Currency from './pages/Currency';
import './App.css';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <main className="main-content">
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/login"    element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Rutas privadas */}
                        <Route path="/products" element={
                            <PrivateRoute><Products /></PrivateRoute>
                        } />
                        <Route path="/currency" element={
                            <PrivateRoute><Currency /></PrivateRoute>
                        } />

                        {/* Redireccionamiento por defecto */}
                        <Route path="/"  element={<Navigate to="/products" replace />} />
                        <Route path="*"  element={<Navigate to="/products" replace />} />
                    </Routes>
                </main>
            </BrowserRouter>
        </AuthProvider>
    );
}
