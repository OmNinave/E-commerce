import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Wishlist.css';

export default function Wishlist() {
  const { user } = useContext(AuthContext);
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

      const response = await fetch(`/api/users/${user.id}/wishlist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      setWishlistItems(data.wishlist || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const productsMap = {};
        (data.products || []).forEach(product => {
          productsMap[product.id] = product;
        });
        setProducts(productsMap);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/users/${user.id}/wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

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
      // Add to cart and then remove from wishlist
      const cartResponse = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      if (cartResponse.ok) {
        await handleRemoveFromWishlist(productId);
        alert('Item moved to cart');
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
