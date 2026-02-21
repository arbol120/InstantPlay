import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CURRENCIES = ['USD', 'MXN', 'EUR', 'GBP', 'CAD', 'JPY', 'BRL', 'ARS', 'COP', 'CLP'];

export default function Currency() {
    const { user } = useAuth();
    const [form, setForm] = useState({ amount: 1, from: 'USD', to: 'MXN' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleConvert = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const params = new URLSearchParams(form);
            const res = await fetch(`${API}/api/currency?${params}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();

            if (res.ok) setResult(data);
            else setError(data.message || 'Error al convertir');
        } catch {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const swap = () => setForm(f => ({ ...f, from: f.to, to: f.from }));

    return (
        <div className="currency-page">
            <div className="currency-card">
                <h2>💱 Conversor de Divisas</h2>
                <p className="currency-subtitle">Tipos de cambio en tiempo real</p>

                <form onSubmit={handleConvert} className="currency-form">
                    <div className="currency-row">
                        <div className="currency-group">
                            <label>Cantidad</label>
                            <input
                                name="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="currency-group">
                            <label>De</label>
                            <select name="from" value={form.from} onChange={handleChange}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <button type="button" className="swap-btn" onClick={swap} title="Intercambiar">⇄</button>
                        <div className="currency-group">
                            <label>A</label>
                            <select name="to" value={form.to} onChange={handleChange}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Consultando...' : 'Convertir'}
                    </button>
                </form>

                {result && (
                    <div className="currency-result">
                        <div className="result-main">
                            <span className="result-amount">{result.amount} {result.from}</span>
                            <span className="result-equals">=</span>
                            <span className="result-converted">{result.converted} {result.to}</span>
                        </div>
                        <p className="result-rate">Tasa: 1 {result.from} = {result.rate.toFixed(4)} {result.to}</p>
                        <p className="result-updated">
                            Actualizado: {new Date(result.timestamp * 1000).toLocaleString('es-MX')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
