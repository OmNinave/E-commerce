import React, { useState, useMemo, useEffect } from 'react';
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
    List
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

const ProductList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter States
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 12;

    useEffect(() => {
        const querySearch = searchParams.get('search');
        if (querySearch) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch categories
                const fetchedCategories = await apiService.getCategories();
                setCategories(fetchedCategories || []);

                // Fetch products
                const fetchedProducts = await apiService.getProducts(1, 100);
                if (fetchedProducts && fetchedProducts.length > 0) {
                    setProducts(fetchedProducts);
                } else {
                    setProducts(staticProducts || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setProducts(staticProducts || []);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' ||
                product.category === selectedCategory ||
                (product.category_id && categories.find(c => c.id === product.category_id)?.name === selectedCategory);

            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return (a.price || 0) - (b.price || 0);
                case 'price-desc': return (b.price || 0) - (a.price || 0);
                case 'name-asc': return (a.name || '').localeCompare(b.name || '');
                case 'name-desc': return (b.name || '').localeCompare(a.name || '');
                default: return 0;
            }
        });
    }, [products, searchTerm, selectedCategory, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, sortBy]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All');
        setSortBy('featured');
        setCurrentPage(1);
    };

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Categories */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Categories
                </h3>
                <div className="space-y-2">
                    {/* All Category */}
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'All'
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All Products
                    </button>

                    {/* Database Categories */}
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.name
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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900">Catalog</h1>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <span className="text-sm text-gray-500">
                                {filteredProducts.length} results
                            </span>
                        </div>

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
                                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex gap-16">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 pr-8">
                        <div className="sticky top-24">
                            <FilterContent />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl h-[400px] animate-pulse" />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                    <AnimatePresence mode='popLayout'>
                                        {currentProducts.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex items-center justify-center gap-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                // Show first page, last page, current page, and pages around current
                                                const showPage =
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1);

                                                const showEllipsis =
                                                    (page === currentPage - 2 && currentPage > 3) ||
                                                    (page === currentPage + 2 && currentPage < totalPages - 2);

                                                if (showEllipsis) {
                                                    return (
                                                        <span key={page} className="px-2 text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                if (!showPage) return null;

                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => handlePageChange(page)}
                                                        className={`rounded-full w-10 h-10 ${currentPage === page
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
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
