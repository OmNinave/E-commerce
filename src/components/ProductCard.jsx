import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  // Debug logging
  console.log('🎴 ProductCard received product:', product);

  const { addToCart } = useCart();
  const { formatPrice, convertPrice } = useCurrency();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback placeholder image
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  const handleImageError = () => {
    setImageError(true);
  };

  // Generate consistent rating based on product ID (seed-based)
  const generateConsistentRating = (id) => {
    const seed = id * 9301 + 49297;
    const random = (seed % 233280) / 233280;
    return (4 + random).toFixed(1);
  };

  const generateConsistentReviewCount = (id) => {
    const seed = id * 7919 + 12345;
    return Math.floor((seed % 450) + 50);
  };

  const rating = generateConsistentRating(product.id);
  const reviewCount = generateConsistentReviewCount(product.id);

  // Calculate discount percentage from prices
  const discount = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/cart');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="product-card-link"
      aria-label={`View details for ${product.name}`}
    >
      <article className="product-card">
        <div className="product-image-container">
          {/* Discount Badge - Only show if there's an actual discount */}
          {discount && <div className="discount-badge">{discount}% OFF</div>}

          {/* Wishlist Button */}
          <button
            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>

          <img
            src={imageError ? placeholderImage : (product.image || placeholderImage)}
            alt={product.name}
            className="product-image"
            onError={handleImageError}
          />
        </div>

        <div className="product-card-content">
          {/* Rating */}
          <div className="product-rating">
            <div className="stars">
              {'⭐'.repeat(Math.floor(rating))}
            </div>
            <span className="rating-text">{rating}</span>
            <span className="review-count">({reviewCount})</span>
          </div>

          <h3 className="product-name">{product.name}</h3>
          <p className="product-model">Model: {product.model}</p>
          <p className="product-tagline">{product.tagline}</p>

          {/* Price Section */}
          {product.price !== undefined && product.price !== null && (
            <div className="product-price-section">
              <div className="price-row">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.originalPrice !== undefined && product.originalPrice !== null && (
                  <span className="original-price">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              {product.originalPrice !== undefined && product.originalPrice !== null && (
                <span className="savings-text">
                  Save {formatPrice(product.originalPrice - product.price)} ({discount}% off)
                </span>
              )}
            </div>
          )}

          <div className="product-card-actions">
            <button
              onClick={handleAddToCart}
              className="add-to-cart-button"
              aria-label={`Add ${product.name} to cart`}
            >
              🛒 Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="buy-now-button"
              aria-label={`Buy ${product.name} now`}
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;