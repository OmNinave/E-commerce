import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewError, setReviewError] = useState(null);

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  // Fetch product and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch product
        const fetchedProduct = await apiService.getProduct(id);
        setProduct(fetchedProduct);

        // Fetch reviews
        try {
          const fetchedReviews = await apiService.getProductReviews(id);
          setReviews(fetchedReviews || []);
        } catch (reviewErr) {
          console.error('Failed to load reviews:', reviewErr);
          setReviews([]);
        }

      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Save to recently viewed
  useEffect(() => {
    if (product) {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = recentlyViewed.filter(item => item.id !== product.id);
      const updated = [{ id: product.id, name: product.name, image: product.image }, ...filtered].slice(0, 5);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [product]);

  // Get similar products
  const [similarProducts, setSimilarProducts] = useState([]);
  useEffect(() => {
    if (product) {
      const fetchSimilar = async () => {
        try {
          const allProducts = await apiService.getProducts();
          const similar = allProducts.filter(p =>
            p.category === product.category && p.id !== product.id
          ).slice(0, 4);
          setSimilarProducts(similar);
        } catch (err) {
          console.error('Failed to load similar products:', err);
        }
      };
      fetchSimilar();
    }
  }, [product]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setReviewError(null);
      const newReview = await apiService.addProductReview(id, userRating, userComment);
      setReviews([newReview, ...reviews]);
      setUserComment('');
      setUserRating(5);
      alert('Review submitted successfully!');
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'applications', label: 'Applications' },
    { id: 'operation', label: 'Operation' },
    { id: 'advantages', label: 'Advantages' },
    { id: 'considerations', label: 'Considerations' },
    { id: 'compliance', label: 'Compliance' },
  ];

  const handleDownloadSpecs = () => {
    alert("Demo Mode: Datasheet download simulation.\n\nIn a real application, this would download the PDF specification sheet.");
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiService.addToWishlist(user.id, product.id);
      alert('Added to wishlist!');
    } catch (err) {
      alert('Failed to add to wishlist: ' + err.message);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  const renderTabContent = () => {
    if (!product) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h2>Product Overview</h2>
            <p className="overview-text">{product.overview}</p>
          </div>
        );

      case 'features':
        return (
          <div className="tab-content">
            <h2>Technical Capabilities & Features</h2>
            <ul className="features-list">
              {product.features && product.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <span className="feature-bullet">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'specifications':
        return (
          <div className="tab-content">
            <h2>Physical Specifications</h2>
            <div className="specifications-grid">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <dt className="spec-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </dt>
                  <dd className="spec-value">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="tab-content">
            <h2>Applications & Use Cases</h2>
            <div className="applications-grid">
              {product.applications && product.applications.map((application, index) => (
                <div key={index} className="application-card">
                  <span className="application-icon">🔬</span>
                  <p>{application}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'operation':
        return (
          <div className="tab-content">
            <h2>Ease of Operation & Maintenance</h2>
            <p className="operation-text">{product.operation}</p>
          </div>
        );

      case 'advantages':
        return (
          <div className="tab-content">
            <h2>Key Advantages</h2>
            <ul className="advantages-list">
              {product.advantages && product.advantages.map((advantage, index) => (
                <li key={index} className="advantage-item">
                  <span className="advantage-icon">✨</span>
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'considerations':
        return (
          <div className="tab-content">
            <h2>Important Considerations</h2>
            <ul className="considerations-list">
              {product.considerations && product.considerations.map((consideration, index) => (
                <li key={index} className="consideration-item">
                  <span className="consideration-icon">⚠️</span>
                  {consideration}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'compliance':
        return (
          <div className="tab-content">
            <h2>Quality & Compliance</h2>
            <p className="compliance-text">{product.compliance}</p>
            <div className="commitment-section">
              <h3>Our Commitment</h3>
              <p className="commitment-text">{product.commitment}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <div className="not-found-content">
          <h1>Product Not Found</h1>
          <p>{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <Link to="/products" className="back-button">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/products" className="breadcrumb-link">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      {/* Promotional Banner */}
      <div className="promo-banner">
        <div className="promo-content">
          <span className="promo-icon">🎉</span>
          <span className="promo-text">Limited Time Offer: Get 15% off on bulk orders! | Free shipping on orders over $5000</span>
        </div>
      </div>

      <div className="product-detail-header">
        <div className="product-image-section">
          <div className="main-image-container">
            <img
              src={product.image}
              alt={product.name}
              className="product-detail-image"
              onClick={() => setShowImageZoom(!showImageZoom)}
            />
            {showImageZoom && (
              <div className="image-zoom-overlay" onClick={() => setShowImageZoom(false)}>
                <img src={product.image} alt={product.name} className="zoomed-image" />
              </div>
            )}
            <div className="image-badge">
              <span className="badge-text">Premium Quality</span>
            </div>
          </div>

          {/* Image thumbnails (mock - using same image) */}
          <div className="image-thumbnails">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={product.image} alt={`View ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-info-section">
          <div className="product-category-badge">{product.category}</div>
          <h1 className="product-detail-name">{product.name}</h1>

          {/* Rating Section */}
          <div className="rating-section">
            <div className="stars-container">
              {renderStars(Math.round(averageRating))}
              <span className="rating-number">{averageRating.toFixed(1)}</span>
            </div>
            <span className="reviews-count">({reviews.length} reviews)</span>
          </div>

          <p className="product-detail-model">Model: {product.model}</p>
          <p className="product-detail-id">Product ID: {product.productId}</p>
          <p className="product-detail-tagline">{product.tagline}</p>

          {/* Price Section */}
          {product.price !== undefined && product.price !== null && (
            <div className="product-detail-price-section">
              <div className="price-main">
                <span className="detail-current-price">{formatPrice(product.price)}</span>
                {product.originalPrice !== undefined && product.originalPrice !== null && (
                  <>
                    <span className="detail-original-price">{formatPrice(product.originalPrice)}</span>
                    <span className="detail-discount-badge">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.originalPrice !== undefined && product.originalPrice !== null && (
                <p className="detail-savings-text">
                  You save: {formatPrice(product.originalPrice - product.price)}
                  ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% discount)
                </p>
              )}
            </div>
          )}

          {/* Offers Section */}
          <div className="offers-section">
            <h3 className="offers-title">Available Offers</h3>
            <div className="offer-item">
              <span className="offer-icon">🏷️</span>
              <span className="offer-text">Bank Offer: 10% instant discount on HDFC Bank Credit Cards</span>
            </div>
            <div className="offer-item">
              <span className="offer-icon">💳</span>
              <span className="offer-text">Special Price: Get extra 5% off (price inclusive of discount)</span>
            </div>
            <div className="offer-item">
              <span className="offer-icon">🎁</span>
              <span className="offer-text">Partner Offer: Purchase now and get free calibration service worth $200</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <label htmlFor="quantity">Quantity:</label>
            <div className="quantity-controls">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="qty-input"
              />
              <button
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleAddToCart} className="add-to-cart-button-detail">
              🛒 Add to Cart
            </button>
            <button onClick={handleBuyNow} className="buy-now-button-detail">
              ⚡ Buy Now
            </button>
            <button onClick={handleAddToWishlist} className="wishlist-button-detail" style={{ marginLeft: '10px', padding: '10px', background: 'none', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>
              ❤️ Add to Wishlist
            </button>
            <button onClick={handleDownloadSpecs} className="download-specs-button" style={{ marginLeft: '10px', padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>
              📄 Download Specs
            </button>
          </div>

          <div className="quick-info">
            <div className="quick-info-item">
              <span className="quick-info-icon">📦</span>
              <div>
                <strong>Availability</strong>
                <p className="in-stock">In Stock</p>
              </div>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-icon">🚚</span>
              <div>
                <strong>Shipping</strong>
                <p>2-4 Weeks</p>
              </div>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-icon">🛡️</span>
              <div>
                <strong>Warranty</strong>
                <p>3 Years</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Certified Product</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Secure Payment</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail-content">
        <div className="tabs-container">
          <div className="tabs-navigation" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="tab-panel"
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={activeTab}
          >
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title">Customer Reviews & Ratings</h2>
        <div className="reviews-summary">
          <div className="rating-overview">
            <div className="average-rating">
              <span className="rating-big">{averageRating.toFixed(1)}</span>
              <div className="stars-large">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="total-reviews">{reviews.length} reviews</span>
            </div>
          </div>

          <div className="write-review-section">
            <h3>Write a Review</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="rating-input">
                  <label>Rating:</label>
                  <div className="star-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= userRating ? 'filled' : ''}`}
                        onClick={() => setUserRating(star)}
                        style={{ cursor: 'pointer', fontSize: '24px' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="comment-input">
                  <label>Comment:</label>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                    placeholder="Share your experience with this product..."
                    rows="4"
                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  />
                </div>
                {reviewError && <p className="error-message">{reviewError}</p>}
                <button type="submit" className="submit-review-btn" style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <p>Please <Link to="/login">login</Link> to write a review.</p>
              </div>
            )}
          </div>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">{review.author.charAt(0)}</div>
                      <div>
                        <h4 className="reviewer-name">{review.author}</h4>
                        {review.verified && (
                          <span className="verified-badge">✓ Verified Purchase</span>
                        )}
                      </div>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="review-date">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2 className="section-title">Similar Products You May Like</h2>
          <div className="similar-products-grid">
            {similarProducts.map((similarProduct) => (
              <div
                key={similarProduct.id}
                className="similar-product-card"
                onClick={() => navigate(`/products/${similarProduct.id}`)}
              >
                <div className="similar-product-image">
                  <img src={similarProduct.image} alt={similarProduct.name} />
                  <div className="quick-view-badge">Quick View</div>
                </div>
                <div className="similar-product-info">
                  <h3 className="similar-product-name">{similarProduct.name}</h3>
                  <p className="similar-product-model">{similarProduct.model}</p>
                  <div className="similar-product-rating">
                    {renderStars(4)}
                    <span className="rating-count">(4.0)</span>
                  </div>
                  <button className="similar-product-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsored Products Ad */}
      <div className="sponsored-section">
        <div className="sponsored-header">
          <span className="sponsored-label">Sponsored</span>
          <span className="sponsored-info">ℹ️</span>
        </div>
        <div className="sponsored-content">
          <div className="sponsored-ad">
            <div className="ad-image">
              <img src={product.image} alt="Sponsored product" />
            </div>
            <div className="ad-content">
              <h3 className="ad-title">Complete Your Lab Setup</h3>
              <p className="ad-description">Get 20% off on complementary equipment when you purchase this product</p>
              <button className="ad-cta-button">Shop Now →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail-footer">
        <button onClick={() => navigate('/products')} className="back-to-products">
          ← Back to Products
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="scroll-top">
          ↑ Back to Top
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;