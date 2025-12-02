import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShoppingCart, Zap, Heart } from 'lucide-react';
import { getProductImage } from '../utils/imageUtils';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const productImage = getProductImage(product);

  // Generate consistent rating
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

  // Calculate discount - use backend discount data if available
  // The backend might return 'price' (selling price) and 'originalPrice' (base price)
  // OR 'selling_price' and 'base_price'
  // OR a 'discount' object

  const originalPrice = Number(product.base_price || product.originalPrice || 0);
  const currentPrice = Number(product.selling_price || product.price || 0);

  let discountPercentage = 0;

  if (product.discount && product.discount.is_active) {
    if (product.discount.discount_type === 'percentage') {
      discountPercentage = Math.round(product.discount.discount_value);
    } else {
      // Fixed amount discount
      if (originalPrice > 0) {
        discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      }
    }
  } else if (originalPrice > currentPrice && originalPrice > 0) {
    // Fallback calculation if discount object is missing but prices differ
    discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

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

  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="product-card-link group"
      aria-label={`View details for ${product.name}`}
    >
      <article className="product-card h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100">

        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {discountPercentage}% OFF
            </div>
          )}

          <button
            className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110 ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            onClick={handleWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />

          {/* Quick Actions Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-2">
            {/* Actions moved to bottom of card for better mobile UX */}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400 text-xs">
              {'⭐'.repeat(Math.floor(rating))}
            </div>
            <span className="text-xs font-medium text-gray-600 ml-1">{rating}</span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>

          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 mb-4 font-medium">
            Model: {product.model}
          </p>

          <div className="mt-auto space-y-4">
            {/* Price */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </span>
              {discountPercentage > 0 && originalPrice > currentPrice && (
                <span className="text-sm text-gray-400 line-through decoration-2 decoration-gray-400">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${quantityInCart > 0 ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}
              >
                <ShoppingCart className="w-4 h-4" />
                {quantityInCart > 0 ? `Added (${quantityInCart})` : 'Add'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4" />
                Buy
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;