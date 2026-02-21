import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Products() {
    const { user, isAdmin } = useAuth();

    // Lista y paginación
    const [products, setProducts]   = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage]           = useState(1);
    const [loading, setLoading]     = useState(false);
    const [message, setMessage]     = useState({ text: '', type: '' });

    // Filtros
    const [filters, setFilters] = useState({ name: '', minPrice: '', maxPrice: '' });

    // Formulario crear/editar
    const [form, setForm]       = useState({ name: '', description: '', price: '', category: '' });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm]   = useState(false);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 6,
                ...(filters.name     && { name: filters.name }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
            });

            const res = await fetch(`${API}/api/products?${params}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.status === 401) return window.location.href = '/login';
            const data = await res.json();
            setProducts(data.products);
            setPagination(data.pagination);
        } catch {
            showMsg('Error al cargar productos', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, filters, user.token]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1);
    };

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url    = editingId ? `${API}/api/products/${editingId}` : `${API}/api/products`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ ...form, price: Number(form.price) })
            });
            const data = await res.json();

            if (res.ok) {
                showMsg(editingId ? 'Producto actualizado ✓' : 'Producto creado ✓');
                setForm({ name: '', description: '', price: '', category: '' });
                setEditingId(null);
                setShowForm(false);
                fetchProducts();
            } else {
                showMsg(data.message || (data.errors && data.errors.join(', ')), 'error');
            }
        } catch {
            showMsg('Error en el servidor', 'error');
        }
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || ''
        });
        setEditingId(product._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este producto?')) return;
        try {
            const res = await fetch(`${API}/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) { showMsg('Producto eliminado'); fetchProducts(); }
            else showMsg(data.message, 'error');
        } catch {
            showMsg('Error al eliminar', 'error');
        }
    };

    return (
        <div className="products-page">
            <div className="page-header">
                <h2> 🎮 Catálogo</h2>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setForm({ name: '', description: '', price: '', category: '' });
                    }}>
                        {showForm ? '✕ Cancelar' : '+ Agregar Producto'}
                    </button>
                )}
            </div>

            {/* Mensaje */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Formulario (solo admin) */}
            {isAdmin && showForm && (
                <div className="card form-card">
                    <h3>{editingId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
                    <form onSubmit={handleSubmit} className="product-form">
                        <input name="name" placeholder="Nombre *" value={form.name} onChange={handleFormChange} required />
                        <input name="description" placeholder="Descripción" value={form.description} onChange={handleFormChange} />
                        <input name="price" type="number" placeholder="Precio *" value={form.price} onChange={handleFormChange} required min="0" step="0.01" />
                        <input name="category" placeholder="Categoría" value={form.category} onChange={handleFormChange} />
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Actualizar' : 'Crear Producto'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filtros */}
            <div className="card filters-card">
                <h4>🔍 Filtrar</h4>
                <div className="filters-row">
                    <input name="name" placeholder="Buscar por nombre" value={filters.name} onChange={handleFilterChange} />
                    <input name="minPrice" type="number" placeholder="Precio mín." value={filters.minPrice} onChange={handleFilterChange} min="0" />
                    <input name="maxPrice" type="number" placeholder="Precio máx." value={filters.maxPrice} onChange={handleFilterChange} min="0" />
                    <button className="btn-secondary" onClick={() => { setFilters({ name: '', minPrice: '', maxPrice: '' }); setPage(1); }}>
                        Quitar filtros
                    </button>
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <div className="loading-center">⏳ Cargando...</div>
            ) : products.length === 0 ? (
                <div className="empty-state">No hay productos que coincidan con los filtros.</div>
            ) : (
                <div className="products-grid">
                    {products.map(p => (
                        <div key={p._id} className="product-card">
                            <div className="product-category">{p.category || 'General'}</div>
                            <h4>{p.name}</h4>
                            <p className="product-desc">{p.description || 'Sin descripción'}</p>
                            <div className="product-footer">
                                <span className="product-price">${Number(p.price).toFixed(2)}</span>
                                {isAdmin && (
                                    <div className="product-actions">
                                        <button className="btn-edit" onClick={() => handleEdit(p)}>✏️</button>
                                        <button className="btn-delete" onClick={() => handleDelete(p._id)}>🗑️</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="btn-page"
                    >← Anterior</button>
                    <span>Página {pagination.page} de {pagination.totalPages} ({pagination.total} productos)</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNextPage}
                        className="btn-page"
                    >Siguiente →</button>
                </div>
            )}
        </div>
    );
}
