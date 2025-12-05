import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import '../styles/AdminDashboard.css';
import ProductsManagement from './ProductsManagement';
import { ExpandableOrderRow, ReturnsView } from './components/OrderComponents';

// API URL - works for both local and production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ========== DATE UTILITY FUNCTIONS ==========
const getCurrentWeek = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const days = (today.getDate() - firstDay.getDate()) / 7;
  return Math.floor(days) + 1;
};

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

const generateYears = () => {
  const currentYear = getCurrentYear();
  return [currentYear - 2, currentYear - 1, currentYear].filter(y => y > 2000).sort();
};

const generateMonths = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const getWeeksInMonth = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const lastDate = lastDay.getDate();
  return Math.ceil((lastDate - firstDay.getDay()) / 7) + 1;
};

const generateWeeks = (year, month) => {
  const weeksCount = getWeeksInMonth(year, month);
  return Array.from({ length: weeksCount }, (_, i) => i + 1);
};

const getMonthName = (monthNum) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNum - 1];
};

// ========== COMPONENT START ==========
const AdminDashboard = ({ admin, onLogout }) => {
  // Core State
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

  // Cascading Dropdown State
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  // View-Specific Time Range States
  const [productsTimeRange, setProductsTimeRange] = useState('month');
  const [productsAnalytics, setProductsAnalytics] = useState(null);

  const [usersTimeRange, setUsersTimeRange] = useState('month');
  const [usersAnalytics, setUsersAnalytics] = useState(null);

  const [ordersTimeRange, setOrdersTimeRange] = useState('month');
  const [ordersAnalytics, setOrdersAnalytics] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Helper Functions
  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  }, []);

  // Data Fetching Functions
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      let url = `${API_URL}/api/admin/analytics?timeRange=${timeRange}&year=${selectedYear}&month=${selectedMonth}&week=${selectedWeek}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics:', response.status);
        if (response.status === 401) handleLogout();
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
      const url = `${API_URL}/api/admin/analytics?timeRange=${productsTimeRange}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setProductsAnalytics(data);
      } else {
        setProductsAnalytics(null);
      }
    } catch (err) {
      console.error('Failed to fetch products analytics:', err);
      setProductsAnalytics(null);
    }
  }, [productsTimeRange]);

  const fetchUsersAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = `${API_URL}/api/admin/analytics?timeRange=${usersTimeRange}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setUsersAnalytics(data);
      } else {
        setUsersAnalytics(null);
      }
    } catch (err) {
      console.error('Failed to fetch users analytics:', err);
      setUsersAnalytics(null);
    }
  }, [usersTimeRange]);

  const fetchOrdersAnalytics = useCallback(async () => {
    try {
      console.log('Fetching orders analytics...', { ordersTimeRange });
      const token = localStorage.getItem('adminToken');
      const url = `${API_URL}/api/admin/analytics/orders?timeRange=${ordersTimeRange}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        console.log('Orders analytics data:', data);
        setOrdersAnalytics(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch orders analytics:', response.status, errorText);
        setOrdersAnalytics(null);
      }
    } catch (err) {
      console.error('Failed to fetch orders analytics:', err);
      setOrdersAnalytics(null);
    }
  }, [ordersTimeRange]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Status update successful:', data);

        // Force immediate refresh of both analytics and orders
        await fetchOrdersAnalytics();
        await fetchAnalytics();

        console.log('✅ Data refreshed');
      } else {
        const error = await response.json();
        console.error('❌ Status update failed:', error);
        alert('Failed to update status: ' + error.error);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  const fetchReturnRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Use the newly optimized endpoint that returns full details
      const response = await fetch(`${API_URL}/api/admin/return-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map the backend response to the structure expected by the UI
        const mappedRequests = (data.returnRequests || []).map(req => ({
          id: req.order_id, // UI expects Order ID for actions
          return_request_id: req.id,
          order_number: req.order_number || `#${req.order_id}`,
          first_name: req.first_name || 'Unknown',
          last_name: req.last_name || '',
          status: req.status,
          refund_amount: req.total_amount,
          reason: req.reason,
          order: {
            items: req.items || [],
            date: req.created_at, // Return request date
            total_amount: req.total_amount
          }
        }));
        setReturnRequests(mappedRequests);
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
    }
  }, []);

  const handleApproveReturn = async (req) => {
    if (!window.confirm(`Approve this ${req.status === 'return_requested' ? 'return' : 'replacement'}?`)) return;
    const newStatus = req.status === 'return_requested' ? 'returned' : 'replaced';
    await handleUpdateOrderStatus(req.id, newStatus);
    fetchReturnRequests();
  };

  const handleRejectReturn = async (req) => {
    if (!window.confirm('Reject this request?')) return;
    await handleUpdateOrderStatus(req.id, 'delivered');
    fetchReturnRequests();
  };

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/warehouses`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  }, []);

  const fetchWarehouseInventory = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/warehouse-inventory`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setWarehouseInventory(data.inventory || []);
    } catch (err) {
      console.error('Failed to fetch warehouse inventory:', err);
    }
  }, []);

  const fetchCourierPartners = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/courier-partners`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setCourierPartners(data.couriers || []);
    } catch (err) {
      console.error('Failed to fetch courier partners:', err);
    }
  }, []);

  const fetchSupportTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/support-tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setSupportTickets(data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    }
  }, []);

  const fetchLoyaltyPoints = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/loyalty-points`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setLoyaltyPoints(data.loyaltyData || []);
    } catch (err) {
      console.error('Failed to fetch loyalty points:', err);
    }
  }, []);

  const fetchPaymentSettlements = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/payment-settlements`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setPaymentSettlements(data.settlements || []);
    } catch (err) {
      console.error('Failed to fetch payment settlements:', err);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (activeView === 'dashboard') {
      // Handled by separate effect
    } else if (activeView === 'products') {
      fetchProducts();
    } else if (activeView === 'users') {
      fetchUsers();
    } else if (activeView === 'orders') {
      // Handled by separate effect
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

  useEffect(() => {
    if (activeView === 'dashboard') fetchAnalytics();
  }, [activeView, timeRange, selectedYear, selectedMonth, selectedWeek, fetchAnalytics]);

  useEffect(() => {
    if (activeView === 'products') fetchProductsAnalytics();
  }, [activeView, productsTimeRange, fetchProductsAnalytics]);

  useEffect(() => {
    if (activeView === 'users') fetchUsersAnalytics();
  }, [activeView, usersTimeRange, fetchUsersAnalytics]);

  useEffect(() => {
    if (activeView === 'orders') fetchOrdersAnalytics();
  }, [activeView, ordersTimeRange, fetchOrdersAnalytics]);

  useEffect(() => {
    if (activeView === 'products') {
      const interval = setInterval(fetchProducts, 30000);
      return () => clearInterval(interval);
    }
  }, [activeView, fetchProducts]);

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

  const salesQuantityChartData = (analytics?.charts?.dates || []).map((date, index) => ({
    date: date,
    quantity: analytics?.charts?.quantityData?.[index] || 0,
    sales: analytics?.charts?.salesData?.[index] || 0
  }));

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{admin.full_name}</p>
        </div>

        <nav className="sidebar-nav">
          <button className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
            <span className="nav-icon">▣</span> Dashboard
          </button>
          <button className={activeView === 'products' ? 'active' : ''} onClick={() => setActiveView('products')}>
            <span className="nav-icon">■</span> Products
          </button>
          <button className={activeView === 'users' ? 'active' : ''} onClick={() => setActiveView('users')}>
            <span className="nav-icon">◉</span> Users
          </button>
          <button className={activeView === 'orders' ? 'active' : ''} onClick={() => setActiveView('orders')}>
            <span className="nav-icon">◈</span> Orders
          </button>

          <div className="sidebar-section">
            <h3>Operations</h3>
            <button className={activeView === 'warehouses' ? 'active' : ''} onClick={() => setActiveView('warehouses')}>
              <span className="nav-icon">▦</span> Warehouses
            </button>
            <button className={activeView === 'inventory' ? 'active' : ''} onClick={() => setActiveView('inventory')}>
              <span className="nav-icon">▥</span> Inventory
            </button>
            <button className={activeView === 'couriers' ? 'active' : ''} onClick={() => setActiveView('couriers')}>
              <span className="nav-icon">▨</span> Couriers
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Customer Service</h3>
            <button className={activeView === 'returns' ? 'active' : ''} onClick={() => setActiveView('returns')}>
              <span className="nav-icon">↺</span> Returns
            </button>
            <button className={activeView === 'support' ? 'active' : ''} onClick={() => setActiveView('support')}>
              <span className="nav-icon">◐</span> Support
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Business</h3>
            <button className={activeView === 'loyalty' ? 'active' : ''} onClick={() => setActiveView('loyalty')}>
              <span className="nav-icon">★</span> Loyalty
            </button>
            <button className={activeView === 'settlements' ? 'active' : ''} onClick={() => setActiveView('settlements')}>
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
          <>
            <div className="filters-section">
              <div className="time-filter">
                <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>Week</button>
                <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>Month</button>
                <button className={timeRange === 'year' ? 'active' : ''} onClick={() => setTimeRange('year')}>Year</button>
              </div>
              <div className="cascading-filters">
                <div className="filter-dropdown-group">
                  <label>Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="filter-dropdown">
                    {generateYears().map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                {(timeRange === 'month' || timeRange === 'week') && (
                  <div className="filter-dropdown-group">
                    <label>Month</label>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="filter-dropdown">
                      {generateMonths().map(month => <option key={month} value={month}>{getMonthName(month)}</option>)}
                    </select>
                  </div>
                )}
                {timeRange === 'week' && (
                  <div className="filter-dropdown-group">
                    <label>Week</label>
                    <select value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))} className="filter-dropdown">
                      {generateWeeks(selectedYear, selectedMonth).map(week => <option key={week} value={week}>Week {week}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <motion.div className="dashboard-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              </div>

              {analytics ? (
                <div className="charts-container">
                  <div className="chart-box large">
                    <h3 className="chart-title">📈 Sales & Quantity Trend ({getTimeRangeLabel()})</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={salesQuantityChartData}>
                        <defs>
                          <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="quantity" stroke="#667eea" fill="url(#colorQuantity)" />
                        <Area type="monotone" dataKey="sales" stroke="#ff9800" fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="no-data-message">Loading analytics data...</div>
              )}
            </motion.div>
          </>
        )}

        {activeView === 'products' && <ProductsManagement />}

        {activeView === 'users' && (
          <div className="users-view">
            <div className="view-header">
              <h2>👥 User Management</h2>
              <p className="stats-summary">Total Users: {users.length}</p>
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
                  <button className={ordersTimeRange === 'week' ? 'active' : ''} onClick={() => setOrdersTimeRange('week')}>Week</button>
                  <button className={ordersTimeRange === 'month' ? 'active' : ''} onClick={() => setOrdersTimeRange('month')}>Month</button>
                  <button className={ordersTimeRange === 'year' ? 'active' : ''} onClick={() => setOrdersTimeRange('year')}>Year</button>
                </div>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersAnalytics?.orders && ordersAnalytics.orders.length > 0 ? (
                      ordersAnalytics.orders.map((order) => (
                        <ExpandableOrderRow
                          key={order.orderId}
                          order={{
                            id: order.orderId,
                            user_id: order.userId,
                            userName: order.userName || order.userEmail || 'Unknown',
                            created_at: order.date || order.orderDate,
                            total_amount: order.totalAmount,
                            status: order.status,
                            items: order.items || []
                          }}
                          isExpanded={expandedOrders.has(order.orderId)}
                          onToggle={() => toggleOrderExpansion(order.orderId)}
                          onStatusChange={handleUpdateOrderStatus}
                        />
                      ))
                    ) : (
                      <tr><td colSpan="7">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'warehouses' && (
          <div className="warehouses-view">
            <h2>🏭 Warehouse Management</h2>
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>City</th><th>Status</th></tr>
              </thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id}><td>{w.id}</td><td>{w.name}</td><td>{w.city}</td><td>{w.is_active ? 'Active' : 'Inactive'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'returns' && (
          <ReturnsView
            returnRequests={returnRequests}
            onApprove={handleApproveReturn}
            onReject={handleRejectReturn}
          />
        )}

        {/* Placeholders for other views */}
        {['inventory', 'couriers', 'support', 'loyalty', 'settlements'].includes(activeView) && (
          <div className="placeholder-view">
            <h2>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View</h2>
            <p>Feature coming soon...</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;