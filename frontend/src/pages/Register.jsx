import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Register() {
    const [form, setForm] = useState({ username: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            return setError('Las contraseñas no coinciden');
        }
        if (form.password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username, password: form.password })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess('¡Registro exitoso! Redirigiendo...');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError(data.message || (data.errors && data.errors.join(', ')) || 'Error al registrar');
            }
        } catch {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>📝 Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Correo"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña (mín. 6 caracteres)"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="confirm"
                        placeholder="Confirmar contraseña"
                        value={form.confirm}
                        onChange={handleChange}
                        required
                    />
                    {error   && <p className="error-msg">{error}</p>}
                    {success && <p className="success-msg">{success}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
            </div>
        </div>
    );
}
