import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import api from '../services/api';
import './ProductsManagement.css';

const ProductsManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        model: '',
        tagline: '',
        description: '',
        category_id: 1,
        brand: '',
        sku: '',
        base_price: '',
        selling_price: '',
        stock_quantity: '',
        weight: '',
        is_featured: false
    });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        console.log('🟢 showAddModal state changed to:', showAddModal);
    }, [showAddModal]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminProducts({ search: searchTerm });
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
            alert('Failed to load products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadProducts();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const generateSKU = () => {
        return `PRD-${Date.now()}`;
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            const productData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name),
                sku: formData.sku || generateSKU(),
                base_price: parseFloat(formData.base_price),
                selling_price: parseFloat(formData.selling_price),
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                is_featured: formData.is_featured ? 1 : 0
            };

            await api.createProduct(productData);
            alert('Product added successfully!');
            setShowAddModal(false);
            resetForm();
            loadProducts();
        } catch (error) {
            console.error('Failed to add product:', error);
            alert('Failed to add product: ' + error.message);
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();

        try {
            const productData = {
                ...formData,
                base_price: parseFloat(formData.base_price),
                selling_price: parseFloat(formData.selling_price),
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                is_featured: formData.is_featured ? 1 : 0
            };

            await api.updateProduct(selectedProduct.id, productData);
            alert('Product updated successfully!');
            setShowEditModal(false);
            resetForm();
            loadProducts();
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product: ' + error.message);
        }
    };

    const handleDeleteProduct = async (product) => {
        if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }

        try {
            await api.deleteProduct(product.id);
            alert('Product deleted successfully!');
            loadProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product: ' + error.message);
        }
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            slug: product.slug || '',
            model: product.model || '',
            tagline: product.tagline || '',
            description: product.description || '',
            category_id: product.category_id || 1,
            brand: product.brand || '',
            sku: product.sku || '',
            base_price: product.base_price || '',
            selling_price: product.selling_price || '',
            stock_quantity: product.stock_quantity || '',
            weight: product.weight || '',
            is_featured: product.is_featured === 1
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            model: '',
            tagline: '',
            description: '',
            category_id: 1,
            brand: '',
            sku: '',
            base_price: '',
            selling_price: '',
            stock_quantity: '',
            weight: '',
            is_featured: false
        });
        setSelectedProduct(null);
    };

    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
    };

    return (
        <div className="products-management">
            <div className="products-header">
                <h1>Products Management</h1>
                <button className="btn-primary" onClick={() => {
                    console.log('🔵 Add Product button clicked!');
                    console.log('🔵 Current showAddModal:', showAddModal);
                    setShowAddModal(true);
                    console.log('🔵 setShowAddModal(true) called');
                }}>
                    + Add New Product
                </button>
            </div>

            <div className="products-search">
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <button type="submit" className="btn-search">Search</button>
                </form>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Category</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-products">No products found</td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <div className="product-name-cell">
                                                <strong>{product.name}</strong>
                                                {product.model && <small>{product.model}</small>}
                                            </div>
                                        </td>
                                        <td>{product.sku}</td>
                                        <td>₹{product.selling_price}</td>
                                        <td>
                                            <span className={product.stock_quantity < 10 ? 'low-stock' : ''}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td>{product.category_name || 'N/A'}</td>
                                        <td>
                                            {product.is_featured ? (
                                                <span className="badge-featured">★ Featured</span>
                                            ) : (
                                                <span className="badge-normal">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEditModal(product)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteProduct(product)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={closeModals} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Product</h2>
                            <button className="modal-close" onClick={closeModals}>×</button>
                        </div>
                        <form onSubmit={handleAddProduct} className="product-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Base Price *</label>
                                    <input
                                        type="number"
                                        name="base_price"
                                        value={formData.base_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Selling Price *</label>
                                    <input
                                        type="number"
                                        name="selling_price"
                                        value={formData.selling_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={formData.stock_quantity}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Tagline</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleInputChange}
                                        />
                                        Featured Product
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModals}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && ReactDOM.createPortal(
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Product</h2>
                            <button className="modal-close" onClick={closeModals}>×</button>
                        </div>
                        <form onSubmit={handleEditProduct} className="product-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Base Price *</label>
                                    <input
                                        type="number"
                                        name="base_price"
                                        value={formData.base_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Selling Price *</label>
                                    <input
                                        type="number"
                                        name="selling_price"
                                        value={formData.selling_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={formData.stock_quantity}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Tagline</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleInputChange}
                                        />
                                        Featured Product
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModals}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ProductsManagement;
