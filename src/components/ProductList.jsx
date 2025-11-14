import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import apiService from '../services/api';
// Fallback: Import static products if API fails
import { products as staticProducts } from '../data/products';
import '../styles/ProductList.css';

const PRODUCTS_PER_PAGE = 12;

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const sidebarAd1Ref = useRef(null);
  const sidebarAd2Ref = useRef(null);
  const sidebarAd3Ref = useRef(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API with fallback to static products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 Fetching products from API...');
        
        const fetchedProducts = await apiService.getProducts();
        
        console.log('📦 Fetched products:', {
          isArray: Array.isArray(fetchedProducts),
          length: fetchedProducts?.length || 0,
          firstProduct: fetchedProducts?.[0]?.name || 'N/A'
        });
        
        if (fetchedProducts && Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          console.log(`✅ Loaded ${fetchedProducts.length} products from API`);
          setProducts(fetchedProducts);
          setError(null);
        } else {
          console.warn('⚠️ API returned empty/invalid products array, using static fallback');
          console.log(`📦 Static products available: ${staticProducts?.length || 0}`);
          if (staticProducts && Array.isArray(staticProducts) && staticProducts.length > 0) {
            console.log(`✅ Using ${staticProducts.length} static products as fallback`);
            setProducts(staticProducts);
            setError('Using offline products. Backend may not be running.');
          } else {
            console.error('❌ Static products also unavailable!');
            setProducts([]);
            setError('No products available. Please check data files.');
          }
        }
      } catch (err) {
        console.error('❌ Failed to load products from API:', err);
        console.log(`📦 Falling back to ${staticProducts.length} static products`);
        
        // Fallback to static products
        console.log('📦 Checking static products fallback:', {
          exists: !!staticProducts,
          isArray: Array.isArray(staticProducts),
          length: staticProducts?.length || 0
        });
        
        if (staticProducts && Array.isArray(staticProducts) && staticProducts.length > 0) {
          console.log(`✅ Using ${staticProducts.length} static products as fallback`);
          setProducts(staticProducts);
          setError('Backend server not available. Showing offline products. Start backend with: node db/admin_server.js');
        } else {
          console.error('❌ Static products fallback failed!');
          setError('Failed to load products. Please check your connection and try again.');
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories - with safety check
  const categories = products && products.length > 0 
    ? ['All', ...new Set(products.map(p => p.category).filter(Boolean))]
    : ['All'];

  const filteredProducts = useMemo(() => {
    // Safety check: if products array is empty or not loaded yet
    if (!products || products.length === 0) {
      console.log('⚠️ No products available for filtering');
      return [];
    }

    console.log(`🔍 Filtering ${products.length} products...`, { searchTerm, selectedCategory, sortBy });

    let filtered = products.filter((product) => {
      // Safety checks for undefined/null values
      const productName = (product.name || '').toLowerCase();
      const productModel = (product.model || '').toLowerCase();
      const productId = (product.productId || product.id || '').toLowerCase();
      const productTagline = (product.tagline || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        productName.includes(searchLower) ||
        productModel.includes(searchLower) ||
        productId.includes(searchLower) ||
        productTagline.includes(searchLower);

      const matchesCategory = selectedCategory === 'All' || (product.category === selectedCategory);

      return matchesSearch && matchesCategory;
    });

    console.log(`✅ Filtered to ${filtered.length} products`);

    // Sort products
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const aId = a.id || '';
          const bId = b.id || '';
          return bId.localeCompare(aId);
        });
        break;
      default:
        // featured - keep original order
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]); // FIXED: Added 'products' to dependencies

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    
    // Generate search suggestions
    if (value.length > 1) {
      const suggestions = products
        .filter(p => 
          p.name.toLowerCase().includes(value.toLowerCase()) ||
          p.model.toLowerCase().includes(value.toLowerCase()) ||
          p.category.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          model: p.model,
          category: p.category
        }));
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    navigate(`/products/${productId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange('All');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Auto-scroll and drag-to-scroll effect for slider
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5; // Slow speed (pixels per frame)
    let animationFrameId;
    let isAutoScrolling = true;
    let isDragging = false;
    let startX;
    let scrollLeft;

    const autoScroll = () => {
      if (!isAutoScrolling || isDragging) return;
      
      scrollAmount += scrollSpeed;
      slider.scrollLeft = scrollAmount;

      // Reset to beginning when reaching the end for infinite loop
      if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
        scrollAmount = 0;
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Start auto-scrolling
    animationFrameId = requestAnimationFrame(autoScroll);

    // Pause on hover
    const handleMouseEnter = () => {
      isAutoScrolling = false;
      cancelAnimationFrame(animationFrameId);
    };

    const handleMouseLeave = () => {
      if (!isDragging) {
        isAutoScrolling = true;
        scrollAmount = slider.scrollLeft;
        animationFrameId = requestAnimationFrame(autoScroll);
      }
    };

    // Drag to scroll
    const handleMouseDown = (e) => {
      isDragging = true;
      isAutoScrolling = false;
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      cancelAnimationFrame(animationFrameId);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      slider.scrollLeft = scrollLeft - walk;
      scrollAmount = slider.scrollLeft;
    };

    const handleMouseUp = () => {
      isDragging = false;
      slider.style.cursor = 'grab';
    };

    const handleMouseLeaveWhileDragging = () => {
      if (isDragging) {
        isDragging = false;
        slider.style.cursor = 'grab';
      }
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mouseleave', handleMouseLeaveWhileDragging);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mousemove', handleMouseMove);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mouseleave', handleMouseLeaveWhileDragging);
    };
  }, []);

  // Sidebar ads slow scroll effect
  useEffect(() => {
    const ads = [sidebarAd1Ref.current, sidebarAd2Ref.current, sidebarAd3Ref.current];
    let scrollPositions = [0, 0, 0];
    const scrollSpeeds = [0.1, 0.15, 0.12]; // Very slow speeds for each ad
    let animationFrameId;

    const animateAds = () => {
      ads.forEach((ad, index) => {
        if (!ad) return;
        const img = ad.querySelector('.sidebar-ad-image');
        if (!img) return;

        scrollPositions[index] += scrollSpeeds[index];
        
        // Reset position for infinite loop
        if (scrollPositions[index] >= 20) {
          scrollPositions[index] = 0;
        }

        img.style.transform = `translateY(-${scrollPositions[index]}px)`;
      });

      animationFrameId = requestAnimationFrame(animateAds);
    };

    animateAds();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="product-list-page">
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
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="product-list-page">
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Warning</h3>
            <p style={{ color: '#856404', marginBottom: 0 }}>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      {/* Top Banner Ad */}
      <div className="top-banner-ad">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">🎉 New Year Sale - Up to 30% Off!</h2>
            <p className="banner-subtitle">Limited time offer on all laboratory equipment</p>
          </div>
          <button className="banner-cta">Shop Now</button>
        </div>
      </div>

      <div className="product-list-header">
        <h1 className="page-title">Our Products</h1>
        <p className="page-subtitle">
          Explore our comprehensive range of professional laboratory equipment
        </p>
        {error && products.length > 0 && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '6px', 
            padding: '12px 16px', 
            marginTop: '15px',
            fontSize: '14px',
            color: '#856404'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-bar-section">
        <div className="search-container">
          <label htmlFor="product-search" className="visually-hidden">
            Search products
          </label>
          <div className="search-input-wrapper">
            <input
              id="product-search"
              type="text"
              placeholder="Search by name, model, or product ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="search-input"
              aria-label="Search products"
            />
            <span className="search-icon">🔍</span>
            
            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion.id)}
                  >
                    <span className="suggestion-icon">🔍</span>
                    <div className="suggestion-details">
                      <div className="suggestion-name">{suggestion.name}</div>
                      <div className="suggestion-meta">
                        {suggestion.model} • {suggestion.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="products-main-container">
        {/* Sidebar */}
        <aside className="products-sidebar">
          {/* Filters */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Filters</h3>
            
            {/* Category Filter */}
            <div className="filter-group">
              <button 
                className="filter-title-button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <span>Category</span>
                <span className="filter-arrow">{isCategoryOpen ? '▲' : '▼'}</span>
              </button>
              {isCategoryOpen && (
                <div className="filter-options">
                  {categories.map((category) => (
                    <label key={category} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <span className="filter-label">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'All' || searchTerm) && (
              <button onClick={clearFilters} className="clear-all-filters">
                Clear All Filters
              </button>
            )}
          </div>

          {/* Sort Options */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Sort By</h3>
            
            <div className="filter-group">
              <button 
                className="filter-title-button"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <span>Sort Options</span>
                <span className="filter-arrow">{isSortOpen ? '▲' : '▼'}</span>
              </button>
              {isSortOpen && (
                <div className="filter-options">
                  {[
                    { value: 'featured', label: 'Featured' },
                    { value: 'newest', label: 'Newest First' },
                    { value: 'name-asc', label: 'Name: A to Z' },
                    { value: 'name-desc', label: 'Name: Z to A' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' }
                  ].map((option) => (
                    <label key={option.value} className="filter-option">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                      <span className="filter-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Ad 1 */}
          <div className="sidebar-ad" ref={sidebarAd1Ref}>
            <div className="sidebar-ad-badge">SPONSORED</div>
            <img 
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=400&fit=crop" 
              alt="Premium Lab Equipment" 
              className="sidebar-ad-image"
            />
            <div className="sidebar-ad-content">
              <h4>Premium Lab Equipment</h4>
              <p>Get 20% off on premium microscopes</p>
              <button className="sidebar-ad-btn">Shop Now</button>
            </div>
          </div>

          {/* Sidebar Ad 2 */}
          <div className="sidebar-ad" ref={sidebarAd2Ref}>
            <div className="sidebar-ad-badge">SPONSORED</div>
            <img 
              src="https://images.unsplash.com/photo-1581093458791-9d42e3c4e1e4?w=300&h=400&fit=crop" 
              alt="Lab Safety Equipment" 
              className="sidebar-ad-image"
            />
            <div className="sidebar-ad-content">
              <h4>Safety First</h4>
              <p>Essential lab safety equipment in stock</p>
              <button className="sidebar-ad-btn">View All</button>
            </div>
          </div>

          {/* Sidebar Ad 3 - Banner Style */}
          <div className="sidebar-banner-ad" ref={sidebarAd3Ref}>
            <div className="sidebar-ad-badge">AD</div>
            <h4>🔬 New Arrivals</h4>
            <p>Check out our latest collection of advanced laboratory instruments</p>
            <button className="sidebar-banner-btn">Explore Now</button>
          </div>
        </aside>

        {/* Products Content */}
        <div className="products-content">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f0f0f0', 
              marginBottom: '20px', 
              fontSize: '12px',
              borderRadius: '4px'
            }}>
              <strong>Debug:</strong> Products: {products.length} | 
              Filtered: {filteredProducts.length} | 
              Current Page: {currentPage} | 
              Showing: {currentProducts.length} | 
              Total Pages: {totalPages}
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <>
              {/* Products Grid */}
              <div className="products-grid">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Info & Controls */}
              {totalPages > 1 && (
                <div className="pagination-section">
                  <div className="pagination-info">
                    <p>Page {currentPage} of {totalPages}</p>
                  </div>
                  <div className="pagination">
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      ← Previous
                    </button>

                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Product Image Slider */}
              <div className="product-slider-section">
                <div className="product-slider" ref={sliderRef}>
                  <div className="slider-track">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="slider-item"
                        onClick={() => handleProductClick(product.id)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleProductClick(product.id);
                          }
                        }}
                        aria-label={`View ${product.name}`}
                      >
                        <img src={product.image} alt={product.name} />
                        <div className="slider-item-info">
                          <h3>{product.name}</h3>
                          <p>{product.model}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h2>No products found</h2>
              <p>
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button onClick={clearFilters} className="reset-button">
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;