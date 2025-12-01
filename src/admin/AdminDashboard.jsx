import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import '../styles/AdminDashboard.css';
import ProductsManagement from './ProductsManagement';

// API URL - works for both local and production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ========== DATE UTILITY FUNCTIONS ==========
// Get current week number (1-4 or 1-5 depending on month)
const getCurrentWeek = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const days = (today.getDate() - firstDay.getDate()) / 7;
  return Math.floor(days) + 1;
};

// Get current month (1-12)
const getCurrentMonth = () => new Date().getMonth() + 1;

// Get current year
const getCurrentYear = () => new Date().getFullYear();

// Generate array of years (current year and 2 previous years)
const generateYears = () => {
  const currentYear = getCurrentYear();
  return [currentYear - 2, currentYear - 1, currentYear].filter(y => y > 2000).sort();
};

// Generate months for a specific year (1-12)
const generateMonths = () => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
};

// Get number of weeks in a specific month
const getWeeksInMonth = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const lastDate = lastDay.getDate();
  return Math.ceil((lastDate - firstDay.getDay()) / 7) + 1;
};

// Generate weeks for a specific month (1 to N)
const generateWeeks = (year, month) => {
  const weeksCount = getWeeksInMonth(year, month);
  return Array.from({ length: weeksCount }, (_, i) => i + 1);
};

// Get month name
const getMonthName = (monthNum) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1];
};

// ========== COMPONENT START ==========
const AdminDashboard = ({ admin, onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('month');
  const [productSearch, setProductSearch] = useState('');

  // Professional Workflow States
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseInventory, setWarehouseInventory] = useState([]);
  const [courierPartners, setCourierPartners] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState([]);
  const [paymentSettlements, setPaymentSettlements] = useState([]);

  // ========== CASCADING DROPDOWN STATE ==========
  // Selected year, month, week for dashboard filters
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  // Time range states for each view (using same structure as dashboard)
  const [productsTimeRange, setProductsTimeRange] = useState('month');
  const [productsAnalytics, setProductsAnalytics] = useState(null);
  const [productsYear, setProductsYear] = useState(getCurrentYear());
  const [productsMonth, setProductsMonth] = useState(getCurrentMonth());
  const [productsWeek, setProductsWeek] = useState(getCurrentWeek());

  const [usersTimeRange, setUsersTimeRange] = useState('month');
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [usersYear, setUsersYear] = useState(getCurrentYear());
  const [usersMonth, setUsersMonth] = useState(getCurrentMonth());
  const [usersWeek, setUsersWeek] = useState(getCurrentWeek());

  const [ordersTimeRange, setOrdersTimeRange] = useState('month');
  const [ordersAnalytics, setOrdersAnalytics] = useState(null);
  const [ordersYear, setOrdersYear] = useState(getCurrentYear());
  const [ordersMonth, setOrdersMonth] = useState(getCurrentMonth());
  const [ordersWeek, setOrdersWeek] = useState(getCurrentWeek());

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('adminToken');

    if (token) {
      try {
        // Call backend logout endpoint
        await fetch(`${API_URL}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }

    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Call parent logout handler
    onLogout();
  }, [onLogout]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Build URL with cascading dropdown selections
      let url = `${API_URL}/api/admin/analytics?timeRange=${timeRange}&year=${selectedYear}&month=${selectedMonth}&week=${selectedWeek}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);

      } else {
        console.error('❌ Failed to fetch analytics:', response.status);
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedYear, selectedMonth, selectedWeek, handleLogout]);

  const fetchProductsAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the same endpoint as dashboard - it already has all the data we need
      const url = `${API_URL}/api/admin/analytics?timeRange=${productsTimeRange}`;



      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Use the same structure as dashboard chart
        setProductsAnalytics(data);

      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch products analytics:', response.status, errorText);
        setProductsAnalytics(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch products analytics:', err);
      setProductsAnalytics(null);
    }
  }, [productsTimeRange]);

  const fetchUsersAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the same endpoint as dashboard - it has user registration data
      const url = `${API_URL}/api/admin/analytics?timeRange=${usersTimeRange}`;



      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsersAnalytics(data);

      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch users analytics:', response.status, errorText);
        setUsersAnalytics(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch users analytics:', err);
      setUsersAnalytics(null);
    }
  }, [usersTimeRange]);

  const fetchOrdersAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the dedicated orders analytics endpoint
      const url = `${API_URL}/api/admin/analytics/orders?timeRange=${ordersTimeRange}`;



      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrdersAnalytics(data);

      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch orders analytics:', response.status, errorText);
        setOrdersAnalytics(null);
      }
    } catch (err) {
      console.error('❌ Failed to fetch orders analytics:', err);
      setOrdersAnalytics(null);
    }
  }, [ordersTimeRange]);

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

  // Professional Workflow Data Fetching
  const fetchWarehouses = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/warehouses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  }, []);

  const fetchWarehouseInventory = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/warehouse-inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWarehouseInventory(data.inventory || []);
    } catch (err) {
      console.error('Failed to fetch warehouse inventory:', err);
    }
  }, []);

  const fetchCourierPartners = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/courier-partners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCourierPartners(data.couriers || []);
    } catch (err) {
      console.error('Failed to fetch courier partners:', err);
    }
  }, []);

  const fetchReturnRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/return-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReturnRequests(data.returnRequests || []);
    } catch (err) {
      console.error('Failed to fetch return requests:', err);
    }
  }, []);

  const fetchSupportTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/support-tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSupportTickets(data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    }
  }, []);

  const fetchLoyaltyPoints = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/loyalty-points`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLoyaltyPoints(data.loyaltyData || []);
    } catch (err) {
      console.error('Failed to fetch loyalty points:', err);
    }
  }, []);

  const fetchPaymentSettlements = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/payment-settlements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPaymentSettlements(data.settlements || []);
    } catch (err) {
      console.error('Failed to fetch payment settlements:', err);
    }
  }, []);

  // Main Data Fetching Effect - Handles View Changes
  useEffect(() => {


    if (activeView === 'dashboard') {
      // Dashboard analytics are handled by the cascading dropdown effect
    } else if (activeView === 'products') {
      fetchProducts();
      // Analytics handled by dedicated effect
    } else if (activeView === 'users') {
      fetchUsers();
      // Analytics handled by dedicated effect
    } else if (activeView === 'orders') {
      // Analytics handled by dedicated effect
    } else if (activeView === 'warehouses') {
      fetchWarehouses();
    } else if (activeView === 'inventory') {
      fetchWarehouseInventory();
    } else if (activeView === 'couriers') {
      fetchCourierPartners();
    } else if (activeView === 'returns') {
      fetchReturnRequests();
    } else if (activeView === 'support') {
      fetchSupportTickets();
    } else if (activeView === 'loyalty') {
      fetchLoyaltyPoints();
    } else if (activeView === 'settlements') {
      fetchPaymentSettlements();
    }
  }, [activeView, fetchProducts, fetchUsers, fetchWarehouses, fetchWarehouseInventory, fetchCourierPartners, fetchReturnRequests, fetchSupportTickets, fetchLoyaltyPoints, fetchPaymentSettlements]);

  // Fetch dashboard analytics when filters change
  useEffect(() => {
    if (activeView === 'dashboard') {

      fetchAnalytics();
    }
  }, [activeView, timeRange, selectedYear, selectedMonth, selectedWeek, fetchAnalytics]);

  // Fetch products analytics when view or time range changes
  useEffect(() => {
    if (activeView === 'products') {

      fetchProductsAnalytics();
    }
  }, [activeView, productsTimeRange, fetchProductsAnalytics]);

  // Fetch users analytics when view or time range changes
  useEffect(() => {
    if (activeView === 'users') {

      fetchUsersAnalytics();
    }
  }, [activeView, usersTimeRange, fetchUsersAnalytics]);

  // Fetch orders analytics when view or time range changes
  useEffect(() => {
    if (activeView === 'orders') {

      fetchOrdersAnalytics();
    }
  }, [activeView, ordersTimeRange, fetchOrdersAnalytics]);

  // Auto-refresh products when products view is active
  useEffect(() => {
    if (activeView === 'products') {
      const interval = setInterval(() => {
        fetchProducts();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeView]);

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
            <span className="nav-icon">▣</span> Dashboard
          </button>
          <button
            className={activeView === 'products' ? 'active' : ''}
            onClick={() => {

              setActiveView('products');
            }}
          >
            <span className="nav-icon">■</span> Products
          </button>
          <button
            className={activeView === 'users' ? 'active' : ''}
            onClick={() => setActiveView('users')}
          >
            <span className="nav-icon">◉</span> Users
          </button>
          <button
            className={activeView === 'orders' ? 'active' : ''}
            onClick={() => setActiveView('orders')}
          >
            <span className="nav-icon">◈</span> Orders
          </button>

          {/* Professional Workflow Menu Items */}
          <div className="sidebar-section">
            <h3>Operations</h3>
            <button
              className={activeView === 'warehouses' ? 'active' : ''}
              onClick={() => setActiveView('warehouses')}
            >
              <span className="nav-icon">▦</span> Warehouses
            </button>
            <button
              className={activeView === 'inventory' ? 'active' : ''}
              onClick={() => setActiveView('inventory')}
            >
              <span className="nav-icon">▥</span> Inventory
            </button>
            <button
              className={activeView === 'couriers' ? 'active' : ''}
              onClick={() => setActiveView('couriers')}
            >
              <span className="nav-icon">▨</span> Couriers
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Customer Service</h3>
            <button
              className={activeView === 'returns' ? 'active' : ''}
              onClick={() => setActiveView('returns')}
            >
              <span className="nav-icon">↺</span> Returns
            </button>
            <button
              className={activeView === 'support' ? 'active' : ''}
              onClick={() => setActiveView('support')}
            >
              <span className="nav-icon">◐</span> Support
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Business</h3>
            <button
              className={activeView === 'loyalty' ? 'active' : ''}
              onClick={() => setActiveView('loyalty')}
            >
              <span className="nav-icon">★</span> Loyalty
            </button>
            <button
              className={activeView === 'settlements' ? 'active' : ''}
              onClick={() => setActiveView('settlements')}
            >
              <span className="nav-icon">$</span> Settlements
            </button>
          </div>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <span className="nav-icon">⊗</span> Logout
        </button>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <div className="header-left">
            <h1>E-Commerce Dashboard</h1>
          </div>

          {activeView === 'dashboard' && (
            <div className="header-right">
              <div className="date-time-section">
                <div className="date-main">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="date-sub">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          )}
        </header>

        {activeView === 'dashboard' && (
          <div className="filters-section">
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

            {/* Cascading Dropdowns */}
            <div className="cascading-filters">
              {/* Year Dropdown - Always shown */}
              <div className="filter-dropdown-group">
                <label>Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="filter-dropdown"
                >
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Dropdown - Shown for MONTH and WEEK filters */}
              {(timeRange === 'month' || timeRange === 'week') && (
                <div className="filter-dropdown-group">
                  <label>Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="filter-dropdown"
                  >
                    {generateMonths().map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Week Dropdown - Shown only for WEEK filter */}
              {timeRange === 'week' && (
                <div className="filter-dropdown-group">
                  <label>Week</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="filter-dropdown"
                  >
                    {generateWeeks(selectedYear, selectedMonth).map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <motion.div
            className="dashboard-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="stats-cards">
              <div className="stat-card revenue hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">₹{(analytics?.summary?.totalSales || 0).toLocaleString()}</p>
                  <span className="stat-label">{getTimeRangeLabel()}</span>
                </div>
              </div>

              <div className="stat-card quantity hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>Quantity Sold</h3>
                  <p className="stat-value">{(analytics?.summary?.totalQuantitySold || 0).toLocaleString()}</p>
                  <span className="stat-label">Units</span>
                </div>
              </div>

              <div className="stat-card orders hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{(analytics?.summary?.totalOrders || 0).toLocaleString()}</p>
                  <span className="stat-label">Completed</span>
                </div>
              </div>

              <div className="stat-card traffic hover:scale-105 transition-transform duration-300 shadow-lg">
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
                      <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6c757d', marginLeft: '10px' }}>
                        • {salesQuantityChartData.reduce((sum, d) => sum + d.quantity, 0)} units
                      </span>
                    )}
                  </h3>
                  {salesQuantityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={salesQuantityChartData} key={`area-${timeRange}-${salesQuantityChartData.length}`}>
                        <defs>
                          <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                            <stop offset="50%" stopColor="#764ba2" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#f093fb" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
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
          </motion.div>
        )}

        {activeView === 'products' && (
          <ProductsManagement />
        )}

        {activeView === 'users' && (
          <div className="users-view">
            <div className="view-header">
              <h2>👥 User Management</h2>
              <p className="stats-summary">Total Users: {users.length}</p>
            </div>

            <div className="chart-box large" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', width: '100%' }}>
                <h3 className="chart-title" style={{ margin: 0, flex: '1' }}>
                  📈 New User Registrations ({usersTimeRange === 'week' ? 'This Week' : usersTimeRange === 'month' ? 'This Month' : 'This Year'})
                </h3>
                <div className="time-filter" style={{ flex: '0 0 auto', marginLeft: 'auto' }}>
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
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#66bb6a" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
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

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="orders-view">
            <div className="card orders-analytics">
              <div className="card-header">
                <h3>Orders Analytics</h3>
                <div className="time-range-buttons">
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
              {ordersAnalytics && ordersAnalytics.chartData && ordersAnalytics.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart
                    key={`orders-${ordersTimeRange}-${ordersAnalytics.chartData.length}`}
                    data={ordersAnalytics.chartData.map(item => ({
                      date: item.date,
                      count: item.count || 0,
                      revenue: item.revenue || 0
                    }))}>
                    <defs>
                      <linearGradient id="colorCountOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#ba68c8" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#9c27b0" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRevenueOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
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

        {/* Professional Workflow Views */}
        {activeView === 'warehouses' && (
          <div className="warehouses-view">
            <div className="view-header">
              <h2>🏭 Warehouse Management</h2>
              <p className="stats-summary">Total Warehouses: {warehouses.length}</p>
            </div>
            <div className="warehouses-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.id}>
                      <td>{warehouse.id}</td>
                      <td>{warehouse.name}</td>
                      <td>{warehouse.code}</td>
                      <td>{warehouse.city}</td>
                      <td>{warehouse.state}</td>
                      <td><span className={`status-badge ${warehouse.is_active ? 'active' : 'inactive'}`}>{warehouse.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn view">View Inventory</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'inventory' && (
          <div className="inventory-view">
            <div className="view-header">
              <h2>📦 Warehouse Inventory</h2>
              <p className="stats-summary">Total Inventory Items: {warehouseInventory.length}</p>
            </div>
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>Warehouse</th>
                    <th>Product</th>
                    <th>Stock Quantity</th>
                    <th>Reserved</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseInventory.map((item) => (
                    <tr key={`${item.warehouse_id}-${item.product_id}`}>
                      <td>{item.warehouse_name}</td>
                      <td>{item.product_name}</td>
                      <td>{item.stock_quantity}</td>
                      <td>{item.reserved_quantity}</td>
                      <td>{item.stock_quantity - item.reserved_quantity}</td>
                      <td><span className={`status-badge ${item.stock_quantity <= item.low_stock_threshold ? 'low-stock' : 'in-stock'}`}>{item.stock_quantity <= item.low_stock_threshold ? 'Low Stock' : 'In Stock'}</span></td>
                      <td>
                        <button className="action-btn edit">Update Stock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'couriers' && (
          <div className="couriers-view">
            <div className="view-header">
              <h2>🚚 Courier Partners</h2>
              <p className="stats-summary">Total Couriers: {courierPartners.length}</p>
            </div>
            <div className="couriers-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courierPartners.map((courier) => (
                    <tr key={courier.id}>
                      <td>{courier.id}</td>
                      <td>{courier.name}</td>
                      <td>{courier.code}</td>
                      <td>{courier.contact_person}</td>
                      <td>{courier.phone}</td>
                      <td><span className={`status-badge ${courier.is_active ? 'active' : 'inactive'}`}>{courier.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn view">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'returns' && (
          <div className="returns-view">
            <div className="view-header">
              <h2>↩️ Return Requests</h2>
              <p className="stats-summary">Total Returns: {returnRequests.length}</p>
            </div>
            <div className="returns-table">
              <table>
                <thead>
                  <tr>
                    <th>Return ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Refund Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnRequests.map((returnReq) => (
                    <tr key={returnReq.id}>
                      <td>{returnReq.id}</td>
                      <td>{returnReq.order_number}</td>
                      <td>{returnReq.first_name} {returnReq.last_name}</td>
                      <td>{returnReq.reason}</td>
                      <td><span className={`status-badge ${returnReq.status}`}>{returnReq.status}</span></td>
                      <td>₹{returnReq.refund_amount?.toLocaleString() || 0}</td>
                      <td>
                        <button className="action-btn view">View Details</button>
                        <button className="action-btn approve">Process</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'support' && (
          <div className="support-view">
            <div className="view-header">
              <h2>🎧 Customer Support</h2>
              <p className="stats-summary">Total Tickets: {supportTickets.length}</p>
            </div>
            <div className="support-table">
              <table>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.ticket_number}</td>
                      <td>{ticket.first_name} {ticket.last_name}</td>
                      <td>{ticket.subject}</td>
                      <td><span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span></td>
                      <td><span className={`status-badge ${ticket.status}`}>{ticket.status}</span></td>
                      <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn reply">Reply</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'loyalty' && (
          <div className="loyalty-view">
            <div className="view-header">
              <h2>⭐ Loyalty Program</h2>
              <p className="stats-summary">Total Loyalty Members: {loyaltyPoints.length}</p>
            </div>
            <div className="loyalty-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Points Balance</th>
                    <th>Total Earned</th>
                    <th>Total Redeemed</th>
                    <th>Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyPoints.map((loyalty) => (
                    <tr key={loyalty.id}>
                      <td>{loyalty.first_name} {loyalty.last_name}</td>
                      <td>{loyalty.points}</td>
                      <td>{loyalty.total_earned}</td>
                      <td>{loyalty.total_redeemed}</td>
                      <td><span className={`tier-badge ${loyalty.tier}`}>{loyalty.tier}</span></td>
                      <td>
                        <button className="action-btn view">View History</button>
                        <button className="action-btn adjust">Adjust Points</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'settlements' && (
          <div className="settlements-view">
            <div className="view-header">
              <h2>💰 Payment Settlements</h2>
              <p className="stats-summary">Total Settlements: {paymentSettlements.length}</p>
            </div>
            <div className="settlements-table">
              <table>
                <thead>
                  <tr>
                    <th>Settlement Date</th>
                    <th>Payment Method</th>
                    <th>Total Amount</th>
                    <th>Transaction Count</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSettlements.map((settlement) => (
                    <tr key={settlement.id}>
                      <td>{new Date(settlement.settlement_date).toLocaleDateString()}</td>
                      <td>{settlement.payment_method}</td>
                      <td>₹{settlement.total_amount?.toLocaleString() || 0}</td>
                      <td>{settlement.transaction_count}</td>
                      <td><span className={`status-badge ${settlement.settlement_status}`}>{settlement.settlement_status}</span></td>
                      <td>
                        <button className="action-btn view">View Details</button>
                        <button className="action-btn process">Process</button>
                      </td>
                    </tr>
                  ))}
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