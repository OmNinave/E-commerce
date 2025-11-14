import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/AdminDashboard.css';

// API URL - works for both local and production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard = ({ admin, onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('month');
  const [productSearch, setProductSearch] = useState('');
  
  // Time range states for each view (using same structure as dashboard)
  const [productsTimeRange, setProductsTimeRange] = useState('month');
  const [productsAnalytics, setProductsAnalytics] = useState(null);
  
  const [usersTimeRange, setUsersTimeRange] = useState('month');
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  
  const [ordersTimeRange, setOrdersTimeRange] = useState('month');
  const [ordersAnalytics, setOrdersAnalytics] = useState(null);

  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchAnalytics();
    } else if (activeView === 'products') {
      fetchProducts();
      fetchProductsAnalytics(); // Fetch immediately when switching to products view
    } else if (activeView === 'users') {
      fetchUsers();
      fetchUsersAnalytics(); // Fetch immediately when switching to users view
    } else if (activeView === 'orders') {
      fetchOrdersAnalytics(); // Fetch immediately when switching to orders view
    }
  }, [activeView]);

  // Fetch dashboard analytics when timeRange changes
  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchAnalytics();
    }
  }, [timeRange]);

  // Fetch analytics for each view when time range changes
  useEffect(() => {
    if (activeView === 'products') {
      console.log('🔄 Fetching products analytics for:', productsTimeRange);
      fetchProductsAnalytics();
    }
  }, [activeView, productsTimeRange]);

  useEffect(() => {
    if (activeView === 'users') {
      console.log('🔄 Fetching users analytics for:', usersTimeRange);
      fetchUsersAnalytics();
    }
  }, [activeView, usersTimeRange]);

  useEffect(() => {
    if (activeView === 'orders') {
      console.log('🔄 Fetching orders analytics for:', ordersTimeRange);
      fetchOrdersAnalytics();
    }
  }, [activeView, ordersTimeRange]);

  // Auto-refresh products when products view is active
  useEffect(() => {
    if (activeView === 'products') {
      const interval = setInterval(() => {
        fetchProducts();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeView]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        console.log('📊 Analytics Data:', {
          timeRange: data.timeRange,
          totalQuantity: data.summary?.totalQuantitySold,
          totalOrders: data.summary?.totalOrders,
          chartDates: data.charts?.dates?.length
        });
      } else {
        console.error('❌ Failed to fetch analytics:', response.status);
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchProductsAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the same endpoint as dashboard - it already has all the data we need
      const url = `${API_URL}/api/admin/analytics?timeRange=${productsTimeRange}`;
      
      console.log('📡 Fetching products analytics from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Use the same structure as dashboard chart
        setProductsAnalytics(data);
        console.log('✅ Products Analytics loaded:', {
          timeRange: productsTimeRange,
          dates: data.charts?.dates?.length,
          quantityData: data.charts?.quantityData?.length,
          salesData: data.charts?.salesData?.length,
          hasData: !!(data.charts?.dates && data.charts.dates.length > 0),
          sampleDates: data.charts?.dates?.slice(0, 3)
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch products analytics:', response.status, errorText);
        setProductsAnalytics(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch products analytics:', err);
      setProductsAnalytics(null);
    }
  };

  const fetchUsersAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the same endpoint as dashboard - it has user registration data
      const url = `${API_URL}/api/admin/analytics?timeRange=${usersTimeRange}`;
      
      console.log('📡 Fetching users analytics from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsersAnalytics(data);
        console.log('✅ Users Analytics loaded:', {
          timeRange: usersTimeRange,
          userDates: data.charts?.userDates?.length,
          userCounts: data.charts?.userCounts?.length,
          hasData: !!(data.charts?.userDates && data.charts.userDates.length > 0),
          sampleDates: data.charts?.userDates?.slice(0, 3)
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch users analytics:', response.status, errorText);
        setUsersAnalytics(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch users analytics:', err);
      setUsersAnalytics(null);
    }
  };

  const fetchOrdersAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the dedicated orders analytics endpoint
      const url = `${API_URL}/api/admin/analytics/orders?timeRange=${ordersTimeRange}`;
      
      console.log('📡 Fetching orders analytics from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrdersAnalytics(data);
        console.log('✅ Orders Analytics loaded:', {
          timeRange: ordersTimeRange,
          chartData: data.chartData?.length,
          orders: data.orders?.length,
          totalOrders: data.summary?.totalOrders,
          hasData: !!(data.chartData && data.chartData.length > 0),
          sampleData: data.chartData?.slice(0, 3)
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch orders analytics:', response.status, errorText);
        setOrdersAnalytics(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch orders analytics:', err);
      setOrdersAnalytics(null);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    onLogout();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const getTimeRangeLabel = () => {
    if (timeRange === 'week') return 'This Week';
    if (timeRange === 'month') return 'This Month';
    if (timeRange === 'year') return 'This Year';
    return 'Last Month';
  };

  // Prepare data for Recharts with safety checks
  const salesQuantityChartData = (analytics?.charts?.dates || []).map((date, index) => ({
    date: date, // Already formatted by backend (Sun-Sat, Week 1-4, Jan-Dec)
    quantity: analytics?.charts?.quantityData?.[index] || 0,
    sales: analytics?.charts?.salesData?.[index] || 0
  }));

  console.log('📈 Chart Data:', {
    timeRange,
    rangeLabel: getTimeRangeLabel(),
    dataPoints: salesQuantityChartData.length,
    totalQuantity: salesQuantityChartData.reduce((sum, d) => sum + d.quantity, 0),
    labels: salesQuantityChartData.map(d => d.date)
  });

  // Removed unused chart data

  const filteredProducts = (products || []).filter(product =>
    (product.name || product.productName || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{admin.full_name}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeView === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeView === 'products' ? 'active' : ''}
            onClick={() => setActiveView('products')}
          >
            📦 Products
          </button>
          <button
            className={activeView === 'users' ? 'active' : ''}
            onClick={() => setActiveView('users')}
          >
            👥 Users
          </button>
          <button
            className={activeView === 'orders' ? 'active' : ''}
            onClick={() => setActiveView('orders')}
          >
            🛒 Orders
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <h1>E-Commerce Dashboard</h1>
          <div className="header-info">
            <div className="time-filter">
              <button 
                className={timeRange === 'week' ? 'active' : ''}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={timeRange === 'month' ? 'active' : ''}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={timeRange === 'year' ? 'active' : ''}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
            
            <span className="current-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <div className="dashboard-view">
            <div className="stats-cards">
              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">₹{(analytics?.summary?.totalSales || 0).toLocaleString()}</p>
                  <span className="stat-label">{getTimeRangeLabel()}</span>
                </div>
              </div>

              <div className="stat-card quantity">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>Quantity Sold</h3>
                  <p className="stat-value">{(analytics?.summary?.totalQuantitySold || 0).toLocaleString()}</p>
                  <span className="stat-label">Units</span>
                </div>
              </div>

              <div className="stat-card orders">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{(analytics?.summary?.totalOrders || 0).toLocaleString()}</p>
                  <span className="stat-label">Completed</span>
                </div>
              </div>

              <div className="stat-card traffic">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>User Traffic</h3>
                  <p className="stat-value">{(analytics?.summary?.totalUserTraffic || 0).toLocaleString()}</p>
                  <span className="stat-label">Unique Users</span>
                </div>
              </div>

              <div className="stat-card users new">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <h3>New Users</h3>
                  <p className="stat-value">{(analytics?.summary?.newUsers || 0).toLocaleString()}</p>
                  <span className="stat-label">Last 30 Days</span>
                </div>
              </div>

              <div className="stat-card users old">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Old Users</h3>
                  <p className="stat-value">{(analytics?.summary?.oldUsers || 0).toLocaleString()}</p>
                  <span className="stat-label">Existing</span>
                </div>
              </div>
            </div>

            {analytics ? (
              <div className="charts-container" key={timeRange}>
              {/* Sales & Quantity Trend */}
              <div className="chart-box large">
                <h3 className="chart-title">
                  📈 Sales & Quantity Trend ({getTimeRangeLabel()}) 
                  {salesQuantityChartData.length > 0 && (
                    <span style={{fontSize: '14px', fontWeight: 'normal', color: '#6c757d', marginLeft: '10px'}}>
                      • {salesQuantityChartData.reduce((sum, d) => sum + d.quantity, 0)} units
                    </span>
                  )}
                </h3>
                {salesQuantityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={salesQuantityChartData} key={`area-${timeRange}-${salesQuantityChartData.length}`}>
                      <defs>
                        <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="50%" stopColor="#764ba2" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#f093fb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ff9800" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6c757d" 
                        style={{ fontSize: '12px', fontWeight: '500' }}
                        tick={{ fill: '#6c757d' }}
                      />
                      <YAxis 
                        stroke="#6c757d" 
                        style={{ fontSize: '12px', fontWeight: '500' }}
                        tick={{ fill: '#6c757d' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="quantity" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorQuantity)" 
                        name="Quantity Sold"
                        dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#ff9800" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        name="Sales Revenue"
                        dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#ff9800', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{
                    height: '320px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#6c757d',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    <p>📅 No data available for {getTimeRangeLabel()}</p>
                  </div>
                )}
              </div>
            </div>
            ) : (
              <div className="no-data-message" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '16px'
              }}>
                <p>Loading analytics data...</p>
              </div>
            )}

            {analytics?.topProducts && analytics.topProducts.length > 0 && (
              <div className="top-products">
                <h2>Top Selling Products (By Quantity)</h2>
                <div className="products-grid">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.productId || product.id} className="product-card">
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-info">
                        <h3>{product.productName || product.name || 'Unknown Product'}</h3>
                        <p className="product-quantity">{product.quantitySold || 0} units sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'products' && (
          <div className="products-view">
            <div className="view-header">
              <h2>📦 Products Management</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="stats-summary">
                  Total Products: {products.length}
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Products Sales Graph - Same as Dashboard */}
            <div className="chart-box large" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>
                  📊 Product Sales Trend ({productsTimeRange === 'week' ? 'This Week' : productsTimeRange === 'month' ? 'This Month' : 'This Year'})
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="time-filter">
                    <button 
                      className={productsTimeRange === 'week' ? 'active' : ''}
                      onClick={() => setProductsTimeRange('week')}
                    >
                      Week
                    </button>
                    <button 
                      className={productsTimeRange === 'month' ? 'active' : ''}
                      onClick={() => setProductsTimeRange('month')}
                    >
                      Month
                    </button>
                    <button 
                      className={productsTimeRange === 'year' ? 'active' : ''}
                      onClick={() => setProductsTimeRange('year')}
                    >
                      Year
                    </button>
                  </div>
                </div>
              </div>
              {productsAnalytics && productsAnalytics.charts && productsAnalytics.charts.dates && productsAnalytics.charts.dates.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    key={`products-${productsTimeRange}-${productsAnalytics.charts.dates.length}`}
                    data={(productsAnalytics.charts.dates || []).map((date, index) => ({
                      date: date,
                      quantity: productsAnalytics.charts.quantityData?.[index] || 0,
                      sales: productsAnalytics.charts.salesData?.[index] || 0
                    }))}>
                    <defs>
                      <linearGradient id="colorQuantityProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#764ba2" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#f093fb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSalesProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ff9800" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6c757d" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tick={{ fill: '#6c757d' }}
                    />
                    <YAxis 
                      stroke="#6c757d" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tick={{ fill: '#6c757d' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="quantity" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorQuantityProducts)" 
                      name="Quantity Sold"
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#ff9800" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSalesProducts)" 
                      name="Sales Revenue"
                      dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#ff9800', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '16px', fontWeight: '500' }}>
                  <p>📅 No sales data available for selected period</p>
                </div>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Sold</th>
                      <th>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.productId || product.id}>
                        <td>{product.productId || product.id}</td>
                        <td className="product-name" title={product.name || product.productName}>
                          {product.name || product.productName}
                        </td>
                        <td><span className="category-badge">{product.category}</span></td>
                        <td>
                          <span className={(product.currentQuantity || 0) < 10 ? 'low-stock' : 'stock-ok'}>
                            {product.currentQuantity || 0}
                          </span>
                        </td>
                        <td className="quantity-cell">{product.totalSold || 0}</td>
                        <td>{product.orderCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                <p>No products found{productSearch && ` matching "${productSearch}"`}</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'users' && (
          <div className="users-view">
            <div className="view-header">
              <h2>👥 User Management</h2>
              <p className="stats-summary">Total Users: {users.length}</p>
            </div>

            {/* User Registrations Graph - Same as Dashboard */}
            <div className="chart-box large" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>
                  📈 New User Registrations ({usersTimeRange === 'week' ? 'This Week' : usersTimeRange === 'month' ? 'This Month' : 'This Year'})
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="time-filter">
                    <button 
                      className={usersTimeRange === 'week' ? 'active' : ''}
                      onClick={() => setUsersTimeRange('week')}
                    >
                      Week
                    </button>
                    <button 
                      className={usersTimeRange === 'month' ? 'active' : ''}
                      onClick={() => setUsersTimeRange('month')}
                    >
                      Month
                    </button>
                    <button 
                      className={usersTimeRange === 'year' ? 'active' : ''}
                      onClick={() => setUsersTimeRange('year')}
                    >
                      Year
                    </button>
                  </div>
                </div>
              </div>
              {usersAnalytics && usersAnalytics.charts && usersAnalytics.charts.userDates && usersAnalytics.charts.userDates.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    key={`users-${usersTimeRange}-${usersAnalytics.charts.userDates.length}`}
                    data={(usersAnalytics.charts.userDates || []).map((date, index) => ({
                      date: date,
                      registrations: usersAnalytics.charts.userCounts?.[index] || 0
                    }))}>
                    <defs>
                      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#66bb6a" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6c757d" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tick={{ fill: '#6c757d' }}
                    />
                    <YAxis 
                      stroke="#6c757d" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tick={{ fill: '#6c757d' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#4caf50" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRegistrations)" 
                      name="New Registrations"
                      dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '16px', fontWeight: '500' }}>
                  <p>📅 No registration data available for selected period</p>
                </div>
              )}
            </div>

            {users.length > 0 ? (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.registrationDate || user.accountCreatedDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                <p>No users found</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'orders' && (
          <div className="orders-view">
            <div className="view-header">
              <h2>🛒 Orders Management</h2>
              <p className="stats-summary">Total Orders: {ordersAnalytics?.summary?.totalOrders || analytics?.summary?.totalOrders || 0}</p>
            </div>

            {/* Orders Graph - Same as Dashboard */}
            <div className="chart-box large" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>
                  📊 Orders Trend ({ordersTimeRange === 'week' ? 'This Week' : ordersTimeRange === 'month' ? 'This Month' : 'This Year'})
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="time-filter">
                    <button 
                      className={ordersTimeRange === 'week' ? 'active' : ''}
                      onClick={() => setOrdersTimeRange('week')}
                    >
                      Week
                    </button>
                    <button 
                      className={ordersTimeRange === 'month' ? 'active' : ''}
                      onClick={() => setOrdersTimeRange('month')}
                    >
                      Month
                    </button>
                    <button 
                      className={ordersTimeRange === 'year' ? 'active' : ''}
                      onClick={() => setOrdersTimeRange('year')}
                    >
                      Year
                    </button>
                  </div>
                </div>
              </div>
              {ordersAnalytics && ordersAnalytics.chartData && ordersAnalytics.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    key={`orders-${ordersTimeRange}-${ordersAnalytics.chartData.length}`}
                    data={ordersAnalytics.chartData.map(item => ({
                      date: item.date, // Already formatted by backend (Sun-Sat, Week 1-4, Jan-Dec)
                      count: item.count || 0,
                      revenue: item.revenue || 0
                    }))}>
                    <defs>
                      <linearGradient id="colorCountOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#ba68c8" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#9c27b0" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenueOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ff9800" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6c757d" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tick={{ fill: '#6c757d' }}
                    />
                    <YAxis 
                      stroke="#6c757d" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tick={{ fill: '#6c757d' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#9c27b0" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCountOrders)" 
                      name="Order Count"
                      dot={{ fill: '#9c27b0', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#9c27b0', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#ff9800" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenueOrders)" 
                      name="Revenue (₹)"
                      dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#ff9800', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '16px', fontWeight: '500' }}>
                  <p>📅 No orders data available for selected period</p>
                </div>
              )}
            </div>

            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersAnalytics?.orders && ordersAnalytics.orders.length > 0 ? (
                    ordersAnalytics.orders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.userName || order.userEmail || 'Unknown'}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td className="price-cell">₹{order.totalAmount?.toLocaleString() || 0}</td>
                        <td><span className={`status-badge ${order.status || 'completed'}`}>{order.status || 'completed'}</span></td>
                      </tr>
                    ))
                  ) : analytics?.orders && analytics.orders.length > 0 ? (
                    analytics.orders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.userName || order.userEmail}</td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td className="price-cell">₹{order.totalAmount?.toLocaleString() || 0}</td>
                        <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        No orders found for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;