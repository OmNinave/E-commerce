import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area,
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

  useEffect(() => {
    fetchAnalytics();
    if (activeView === 'products') {
      fetchProducts();
    } else if (activeView === 'users') {
      fetchUsers();
    }
  }, [timeRange, activeView]);

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
    product.productName?.toLowerCase().includes(productSearch.toLowerCase())
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
                  <p className="stat-value">₹0</p>
                  <span className="stat-label">All Products Free</span>
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
                  Sales & Quantity Trend ({getTimeRangeLabel()}) 
                  {salesQuantityChartData.length > 0 && (
                    <span style={{fontSize: '14px', fontWeight: 'normal', color: '#666'}}>
                      {' '}• {salesQuantityChartData.reduce((sum, d) => sum + d.quantity, 0)} units
                    </span>
                  )}
                </h3>
                {salesQuantityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesQuantityChartData} key={`area-${timeRange}-${salesQuantityChartData.length}`}>
                      <defs>
                        <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                      <Legend />
                      <Area type="monotone" dataKey="quantity" stroke="#8884d8" fillOpacity={1} fill="url(#colorQuantity)" name="Quantity Sold" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>
                    <p>📅 No data available for {getTimeRangeLabel()}</p>
                  </div>
                )}
              </div>
            </div>
            ) : (
              <div className="no-data-message">
                <p>Loading analytics data...</p>
              </div>
            )}

            {analytics?.topProducts && analytics.topProducts.length > 0 && (
              <div className="top-products">
                <h2>Top Selling Products (By Quantity)</h2>
                <div className="products-grid">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.productId} className="product-card">
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-info">
                        <h3>{product.productName}</h3>
                        <p className="product-quantity">{product.quantitySold} units sold</p>
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
              <h2>Products Management</h2>
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="search-input"
              />
            </div>
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
                    <tr key={product.productId}>
                      <td>{product.productId}</td>
                      <td className="product-name">{product.productName}</td>
                      <td><span className="category-badge">{product.category}</span></td>
                      <td>
                        <span className={product.currentQuantity < 10 ? 'low-stock' : 'stock-ok'}>
                          {product.currentQuantity}
                        </span>
                      </td>
                      <td className="quantity-cell">{product.totalSold}</td>
                      <td>{product.orderCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="users-view">
            <div className="view-header">
              <h2>User Management</h2>
              <p className="stats-summary">Total Users: {users.length}</p>
            </div>
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
                      <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="orders-view">
            <h2>Orders Management</h2>
            <p>Order management features coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;