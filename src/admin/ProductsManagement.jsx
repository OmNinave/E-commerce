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
    const [productImages, setProductImages] = useState([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [discountData, setDiscountData] = useState({
        has_discount: false,
        discount_type: 'percentage',
        discount_value: 0,
        start_date: '',
        end_date: ''
    });
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
        cost_price: '',
        stock_quantity: '',
        low_stock_threshold: 10,
        weight: '',
        dimensions: '',
        is_featured: false,
        features: '[]',
        specifications: '{}',
        shipping_info: '{}'
    });

    useEffect(() => {
        loadProducts();
    }, []);

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
                cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
                is_featured: formData.is_featured ? 1 : 0,
                features: JSON.parse(formData.features || '[]'),
                specifications: JSON.parse(formData.specifications || '{}'),
                shipping_info: JSON.parse(formData.shipping_info || '{}')
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
                cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
                is_featured: formData.is_featured ? 1 : 0,
                features: JSON.parse(formData.features || '[]'),
                specifications: JSON.parse(formData.specifications || '{}'),
                shipping_info: JSON.parse(formData.shipping_info || '{}')
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

    const openEditModal = async (product) => {
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
            cost_price: product.cost_price || '',
            stock_quantity: product.stock_quantity || '',
            low_stock_threshold: product.low_stock_threshold || 10,
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            is_featured: product.is_featured === 1,
            features: JSON.stringify(product.features || [], null, 2),
            specifications: JSON.stringify(product.specifications || {}, null, 2),
            shipping_info: JSON.stringify(product.shipping_info || {}, null, 2)
        });

        // Product data now includes images from the enriched endpoint
        if (product && product.images) {
            setProductImages(product.images);
        } else {
            setProductImages([]);
        }

        // Set discount data if product has an active discount
        if (product.discount) {
            setDiscountData({
                has_discount: true,
                discount_type: product.discount.discount_type || 'percentage',
                discount_value: product.discount.discount_value || 0,
                start_date: product.discount.start_date || '',
                end_date: product.discount.end_date || ''
            });
        } else {
            setDiscountData({
                has_discount: false,
                discount_type: 'percentage',
                discount_value: 0,
                start_date: '',
                end_date: ''
            });
        }

        setShowEditModal(true);
    };

    const handleAddImage = async () => {
        if (!newImageUrl) return;
        try {
            const updatedImages = await api.addProductImage(selectedProduct.id, {
                image_url: newImageUrl,
                is_primary: productImages.length === 0
            });
            setProductImages(updatedImages);
            setNewImageUrl('');
        } catch (error) {
            console.error('Failed to add image:', error);
            alert('Failed to add image');
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            const updatedImages = await api.deleteProductImage(selectedProduct.id, imageId);
            setProductImages(updatedImages);
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image');
        }
    };

    const handleSetPrimaryImage = async (imageId) => {
        try {
            const updatedImages = await api.setPrimaryProductImage(selectedProduct.id, imageId);
            setProductImages(updatedImages);
        } catch (error) {
            console.error('Failed to set primary image:', error);
            alert('Failed to set primary image');
        }
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
            cost_price: '',
            stock_quantity: '',
            low_stock_threshold: 10,
            weight: '',
            dimensions: '',
            is_featured: false,
            features: '[]',
            specifications: '{}',
            shipping_info: '{}'
        });
        setSelectedProduct(null);
        setProductImages([]);
        setNewImageUrl('');
        setDiscountData({
            has_discount: false,
            discount_type: 'percentage',
            discount_value: 0,
            start_date: '',
            end_date: ''
        });
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
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
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
            {showAddModal && ReactDOM.createPortal(
                <div className="modal-overlay" onClick={closeModals}>
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
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        placeholder="Auto-generated if empty"
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
                                    <label>Category ID</label>
                                    <input
                                        type="number"
                                        name="category_id"
                                        value={formData.category_id}
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
                                    <label>Cost Price</label>
                                    <input
                                        type="number"
                                        name="cost_price"
                                        value={formData.cost_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        placeholder="Internal cost"
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
                                    <label>Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        name="low_stock_threshold"
                                        value={formData.low_stock_threshold}
                                        onChange={handleInputChange}
                                        placeholder="Alert when stock is low"
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

                                <div className="form-group">
                                    <label>Dimensions</label>
                                    <input
                                        type="text"
                                        name="dimensions"
                                        value={formData.dimensions}
                                        onChange={handleInputChange}
                                        placeholder="L x W x H cm"
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

                                <div className="form-group full-width">
                                    <label>Features (JSON Array)</label>
                                    <textarea
                                        name="features"
                                        value={formData.features}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder='["Feature 1", "Feature 2"]'
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Specifications (JSON Object)</label>
                                    <textarea
                                        name="specifications"
                                        value={formData.specifications}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder='{"Key": "Value"}'
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Shipping Info (JSON Object)</label>
                                    <textarea
                                        name="shipping_info"
                                        value={formData.shipping_info}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder='{"Dispatch": "24h"}'
                                        className="font-mono text-sm"
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
                </div>,
                document.body
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
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
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
                                    <label>Category ID</label>
                                    <input
                                        type="number"
                                        name="category_id"
                                        value={formData.category_id}
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
                                    <label>Cost Price</label>
                                    <input
                                        type="number"
                                        name="cost_price"
                                        value={formData.cost_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        placeholder="Internal cost"
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
                                    <label>Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        name="low_stock_threshold"
                                        value={formData.low_stock_threshold}
                                        onChange={handleInputChange}
                                        placeholder="Alert when stock is low"
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

                                <div className="form-group">
                                    <label>Dimensions</label>
                                    <input
                                        type="text"
                                        name="dimensions"
                                        value={formData.dimensions}
                                        onChange={handleInputChange}
                                        placeholder="L x W x H cm"
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

                                <div className="form-group full-width">
                                    <label>Product Images</label>
                                    <div className="images-manager">
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                            <input
                                                type="text"
                                                placeholder="Paste image URL here..."
                                                value={newImageUrl}
                                                onChange={(e) => setNewImageUrl(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <button type="button" onClick={handleAddImage} className="btn-secondary">Add Image</button>
                                        </div>
                                        <div className="images-grid">
                                            {productImages.map(img => (
                                                <div key={img.id} className="image-item" style={{ border: img.is_primary ? '2px solid var(--primary-color)' : '1px solid #eee' }}>
                                                    <img src={img.image_url} alt="Product" />
                                                    <div className="image-actions">
                                                        {!img.is_primary ? (
                                                            <button type="button" className="btn-xs btn-set-primary" onClick={() => handleSetPrimaryImage(img.id)}>Set Primary</button>
                                                        ) : (
                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-color)', padding: '4px' }}>Primary</span>
                                                        )}
                                                        <button type="button" className="btn-xs btn-del-image" onClick={() => handleDeleteImage(img.id)}>Delete</button>
                                                    </div>
                                                    {img.is_primary && <div className="primary-badge">Primary</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Features (JSON Array)</label>
                                    <textarea
                                        name="features"
                                        value={formData.features}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder='["Feature 1", "Feature 2"]'
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Specifications (JSON Object)</label>
                                    <textarea
                                        name="specifications"
                                        value={formData.specifications}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder='{"Key": "Value"}'
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Shipping Info (JSON Object)</label>
                                    <textarea
                                        name="shipping_info"
                                        value={formData.shipping_info}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder='{"Dispatch": "24h"}'
                                        className="font-mono text-sm"
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
