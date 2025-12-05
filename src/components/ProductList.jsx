import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    ShoppingBag,
    LayoutGrid,
    List,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

import apiService from '../services/api';
import ProductCard from './ProductCard';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Slider } from './ui/slider';
import { Select, SelectItem } from './ui/select';
import { Separator } from './ui/separator';
import { products as staticProducts } from '../data/products';

/**
 * ProductList Component - Production Ready
 * Displays a catalog of products with filtering, sorting, and pagination.
 * 
 * FIXES APPLIED:
 * ✅ Debounced search to prevent API spam
 * ✅ Single useEffect for data fetching (no duplicate calls)
 * ✅ Proper error handling with retry
 * ✅ Empty state handling
 * ✅ Loading state without flicker
 * ✅ useCallback to prevent infinite loops
 * ✅ Fixed card heights for consistent grid
 * ✅ Proper URL sync without causing re-renders
 */
const ProductList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- State Management ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 12;

    // --- Refs to prevent unnecessary re-renders ---
    const isInitialMount = useRef(true);

    // FIX #3: Debounce search input (prevents API spam on every keystroke)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // FIX #1 & #2: Single data fetching effect (prevents duplicate API calls)
    // FIX #7: Proper error handling
    // FIX #9: useCallback to prevent infinite loops
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch categories
            const fetchedCategories = await apiService.getCategories();
            setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);

            // Fetch products (page 1, 100 limit for client-side filtering)
            const fetchedProducts = await apiService.getProducts(1, 100);

            // FIX #9: Handle empty/null responses
            if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
                setProducts(fetchedProducts);
            } else {
                setProducts(Array.isArray(staticProducts) ? staticProducts : []);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.message || 'Failed to load products');
            setProducts(Array.isArray(staticProducts) ? staticProducts : []);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty deps - only created once

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // FIX #4: Memoized filtering & sorting (efficient, no unnecessary recalculations)
    const filteredProducts = useMemo(() => {
        // FIX #9: Ensure products is always an array
        const safeProducts = Array.isArray(products) ? products : [];

        return safeProducts.filter(product => {
            // Search filter (case-insensitive, using debounced term)
            const matchesSearch = !debouncedSearchTerm ||
                (product.name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

            // Category filter (by ID for reliability)
            const matchesCategory = selectedCategory === 'All' ||
                String(product.category_id) === String(selectedCategory);

            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            // Sorting logic
            switch (sortBy) {
                case 'price-asc': return (a.price || 0) - (b.price || 0);
                case 'price-desc': return (b.price || 0) - (a.price || 0);
                case 'name-asc': return (a.name || '').localeCompare(b.name || '');
                case 'name-desc': return (b.name || '').localeCompare(a.name || '');
                default: return 0;
            }
        });
    }, [products, debouncedSearchTerm, selectedCategory, sortBy]);

    // FIX #5 & #6: Pagination logic with proper bounds checking
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages); // Ensure page is within bounds
    const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // FIX #4: Reset to page 1 when filters change (prevents empty pages)
    useEffect(() => {
        if (!isInitialMount.current) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm, selectedCategory, sortBy]);

    // FIX: Update URL only when debounced search changes (prevents excessive navigation)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (debouncedSearchTerm) {
            navigate(`/products?search=${encodeURIComponent(debouncedSearchTerm)}`, { replace: true });
        } else {
            navigate('/products', { replace: true });
        }
    }, [debouncedSearchTerm, navigate]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setSelectedCategory('All');
        setSortBy('featured');
        setCurrentPage(1);
    };

    // FIX #7: Error State Component
    const ErrorState = () => (
        <div className="text-center py-32">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Products</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {error || 'Something went wrong. Please try again.'}
            </p>
            <Button onClick={fetchData} className="rounded-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
            </Button>
        </div>
    );

    // FIX #9: Empty State Component
    const EmptyState = () => (
        <div className="text-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                We couldn't find any equipment matching your criteria. Try adjusting your filters.
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-full">
                Clear Filters
            </Button>
        </div>
    );

    // --- Sidebar Content Component ---
    const FilterContent = () => (
        <div className="space-y-8">
            {/* Categories Section */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Categories
                </h3>
                <div className="space-y-2">
                    {/* All Category Button */}
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'All'
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All Products
                    </button>

                    {/* Dynamic Category Buttons */}
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(String(category.id))}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${String(selectedCategory) === String(category.id)
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white pt-0">
            {/* Sticky Header Section */}
            <div className="bg-white border-b sticky top-20 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Title & Results Count */}
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900">Catalog</h1>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <span className="text-sm text-gray-500">
                                {filteredProducts.length} results
                            </span>
                        </div>

                        {/* Search & Sort Controls */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 md:w-72 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search equipment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="hidden md:block w-48">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectItem value="featured">Featured</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden rounded-full"
                                onClick={() => setIsMobileFiltersOpen(true)}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
                <div className="flex gap-16">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 pr-8">
                        <div className="sticky top-40">
                            <FilterContent />
                        </div>
                    </div>

                    {/* Product Grid Section */}
                    <div className="flex-1">
                        {/* FIX #7: Show error state */}
                        {error ? (
                            <ErrorState />
                        ) : isLoading ? (
                            // FIX #8: Loading Skeletons with fixed height
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl h-[480px] animate-pulse" />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                {/* FIX #7 & #8: Product Cards Grid with fixed container height */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mt-12">
                                    <AnimatePresence mode='popLayout'>
                                        {currentProducts.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full" // FIX #8: Ensure consistent height
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-12 mb-16 flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(safePage - 1)}
                                            disabled={safePage === 1}
                                            className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                const showPage =
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= safePage - 1 && page <= safePage + 1);

                                                const showEllipsis =
                                                    (page === safePage - 2 && safePage > 3) ||
                                                    (page === safePage + 2 && safePage < totalPages - 2);

                                                if (showEllipsis) {
                                                    return <span key={page} className="px-2 text-gray-400">...</span>;
                                                }

                                                if (!showPage) return null;

                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={safePage === page ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => handlePageChange(page)}
                                                        className={`rounded-full w-10 h-10 ${safePage === page
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(safePage + 1)}
                                            disabled={safePage === totalPages}
                                            className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // FIX #9: Empty State
                            <EmptyState />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Sheet */}
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetContent className="w-full sm:max-w-md bg-white h-full p-6">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
                    </SheetHeader>
                    <FilterContent />
                    <div className="mt-8 pt-6 border-t">
                        <Button className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800" onClick={() => setIsMobileFiltersOpen(false)}>
                            Show {filteredProducts.length} Results
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ProductList;
