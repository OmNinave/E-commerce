import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Wishlist.css';

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchWishlist();
    fetchProducts();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await apiService.getWishlist(user.id);
      setWishlistItems(items || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsData = await apiService.getProducts();
      const productsMap = {};
      (productsData || []).forEach(product => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await apiService.removeFromWishlist(user.id, productId);
      await fetchWishlist();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddToCart = (productId) => {
    // This would typically dispatch to CartContext
    // For now, we'll navigate to the product page
    navigate(`/product/${productId}`);
  };

  const handleMoveToCart = async (productId) => {
    try {
      // Get product details and add to cart using CartContext
      const product = products[productId];
      if (product) {
        // Add product to cart
        addToCart(product, 1);
        // Remove from wishlist
        await handleRemoveFromWishlist(productId);
        alert('Item added to cart!');
      } else {
        // If product not loaded, navigate to product page
        navigate(`/products/${productId}`);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!user) {
    return <div className="wishlist-container">Please log in to view your wishlist</div>;
  }

  return (
    <div className="wishlist-container">
      <h1>My Wishlist</h1>

      {loading && <div className="loading">Loading wishlist...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && wishlistItems.length === 0 && (
        <div className="empty-state">
          <p>Your wishlist is empty.</p>
          <p>Add items to your wishlist to save them for later!</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      )}

      {!loading && wishlistItems.length > 0 && (
        <div className="wishlist-summary">
          <p>You have <strong>{wishlistItems.length}</strong> item(s) in your wishlist</p>
        </div>
      )}

      {!loading && wishlistItems.length > 0 && (
        <div className="wishlist-grid">
          {wishlistItems.map(item => {
            const product = products[item.productId];
            return (
              <div key={item.id} className="wishlist-card">
                {product ? (
                  <>
                    <div className="product-image">
                      {product.image && (
                        <img src={product.image} alt={product.name} />
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      {product.description && (
                        <p className="description">{product.description.substring(0, 100)}...</p>
                      )}
                      <p className="price">₹{product.price?.toFixed(2) || '0.00'}</p>
                      {product.stock !== undefined && (
                        <p className={`stock ${product.stock > 0 ? 'available' : 'unavailable'}`}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </p>
                      )}
                    </div>
                    <div className="wishlist-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleMoveToCart(item.productId)}
                        disabled={product.stock === 0}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="product-loading">
                    <p>Loading product details...</p>
                    <button
                      className="btn-danger"
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
