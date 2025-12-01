import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const ProductCardProfessional = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { formatPrice } = useCurrency();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 product-card hover-lift"
            onClick={() => navigate(`/products/${product.id}`)}
        >
            {/* Image Container */}
            <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden rounded-2xl product-image-wrapper">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 hover-scale"
                    loading="lazy"
                />

                {/* Badges */}
                {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-gray-900 shadow-sm badge-new">
                            {product.badge}
                        </span>
                    </div>
                )}

                {/* Hover Overlay Actions */}
                <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 product-overlay">
                    <Button
                        className="flex-1 bg-gray-900/90 backdrop-blur-md hover:bg-gray-900 text-white shadow-lg btn-ripple"
                        onClick={handleAddToCart}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-md hover:bg-white shadow-lg text-gray-900 hover-glow"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product.id}`);
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Minimalist Content */}
            <div className="pt-4 px-1">
                <div className="flex justify-between items-start gap-4 mb-1">
                    <h3 className="text-base font-medium text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {product.rating || 4.5}
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through decoration-gray-300">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {product.category}
                </p>
            </div>
        </div>
    );
};

export default ProductCardProfessional;
