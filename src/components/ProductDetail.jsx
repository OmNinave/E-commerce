import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Share2,
  Heart,
  Minus,
  Plus,
  FileText,
  ChevronRight
} from 'lucide-react';
import apiService from '../services/api';
import { getProductImage } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedProduct = await apiService.getProduct(id);
        setProduct(fetchedProduct);

        try {
          const fetchedReviews = await apiService.getProductReviews(id);
          setReviews(fetchedReviews || []);
        } catch (e) {
          console.error("Failed to load reviews", e);
        }
      } catch (err) {
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-gray-900">Product not found</div>;

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-20 pb-20">

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 max-w-7xl mb-8">
        <nav className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/products" className="hover:text-gray-900 transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* LEFT: Image Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden relative group"
            >
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 backdrop-blur text-gray-900 shadow-sm hover:bg-white">
                  {product.category}
                </Badge>
              </div>
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={product.image} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info (Sticky) */}
          <div className="lg:sticky lg:top-28 h-fit space-y-8 z-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">{product.name}</h1>
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{reviews.length} Reviews</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> In Stock
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through decoration-gray-300">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed text-lg">
                {product.overview || product.description || "Experience precision engineering with this state-of-the-art laboratory instrument. Designed for accuracy, durability, and ease of use in demanding research environments."}
              </p>

              <Separator />

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-full h-12 w-32">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center font-semibold text-gray-900">{quantity}</div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-gray-900"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" className="h-14 rounded-full text-lg bg-gray-900 hover:bg-indigo-600 shadow-xl shadow-indigo-200/50" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 rounded-full text-lg border-gray-200" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-3 gap-4 py-6">
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-gray-50">
                  <Truck className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-900">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-gray-50">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-900">3-Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-gray-50">
                  <RotateCcw className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-900">30-Day Returns</span>
                </div>
              </div>

              {/* Technical Tabs */}
              <Tabs defaultValue="features" className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="features" className="rounded-lg">Features</TabsTrigger>
                  <TabsTrigger value="specs" className="rounded-lg">Specs</TabsTrigger>
                  <TabsTrigger value="shipping" className="rounded-lg">Shipping</TabsTrigger>
                </TabsList>

                <div className="bg-gray-50/50 rounded-2xl p-6 mt-6 border border-gray-100">
                  <TabsContent value="features" className="mt-0 space-y-4">
                    <ul className="space-y-3">
                      {product.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-600">
                          <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          {feature}
                        </li>
                      )) || <p className="text-gray-500">No specific features listed.</p>}
                    </ul>
                  </TabsContent>
                  <TabsContent value="specs" className="mt-0">
                    <div className="border rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-gray-100">
                          {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                            <tr key={key} className="bg-white hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50 w-1/3">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  <TabsContent value="shipping" className="mt-0 text-gray-600 leading-relaxed">
                    <p>
                      We offer <strong>free expedited shipping</strong> on all orders over $5,000.
                      Most instruments ship within 24-48 hours.
                      White-glove delivery and installation services are available for sensitive equipment.
                    </p>
                  </TabsContent>
                </div>
              </Tabs>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;