# 📝 SIMPLE COPY-PASTE GUIDE - Admin Panel Fix

## ⚠️ Why Manual?
My automated scripts keep breaking the file due to special character encoding. Manual is safer and only takes 3 minutes!

---

## 🎯 What You're Adding

You already have a component ready: `src/admin/components/OrderComponents.jsx`

Just need to:
1. Import it
2. Add 1 state variable
3. Add 3 small functions
4. Use the components

---

## ✅ Step-by-Step (Copy-Paste)

### **Step 1: Add Import (Line 8)**

Open `src/admin/AdminDashboard.jsx`

**Find line 8:**
```jsx
import ProductsManagement from './ProductsManagement';
```

**Press Enter after it and add:**
```jsx
import { ExpandableOrderRow, ReturnsView } from './components/OrderComponents';
```

---

### **Step 2: Add State (Line 101)**

**Find line 101:**
```jsx
const [ordersWeek, setOrdersWeek] = useState(getCurrentWeek());
```

**Press Enter after it and add:**
```jsx
const [expandedOrders, setExpandedOrders] = useState(new Set());
```

---

### **Step 3: Add Functions (After line 265 - after `handleUpdateOrderStatus` function)**

**Find the `handleUpdateOrderStatus` function (around line 235-265)**

**After its closing `};` add these 4 functions:**

```jsx
const toggleOrderExpand = (orderId) => {
  setExpandedOrders(prev => {
    const newSet = new Set(prev);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    return newSet;
  });
};

const fetchReturnRequests = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      const returns = data.orders
        .filter(o => o.status === 'return_requested' || o.status === 'replace_requested')
        .map(order => ({
          id: order.id,
          order_number: `#${order.id}`,
          first_name: order.userName?.split(' ')[0] || 'Unknown',
          last_name: order.userName?.split(' ')[1] || '',
          status: order.status,
          refund_amount: order.totalAmount,
          order: order
        }));
      setReturnRequests(returns);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

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
```

---

### **Step 4: Add useEffect (After existing useEffects around line 475)**

**Find the useEffect for orders (around line 469-475):**
```jsx
useEffect(() => {
  if (activeView === 'orders') {
    fetchOrdersAnalytics();
  }
}, [activeView, fetchOrdersAnalytics]);
```

**After it, add:**
```jsx
useEffect(() => {
  if (activeView === 'returns') {
    fetchReturnRequests();
  }
}, [activeView]);
```

---

### **Step 5: Update Orders Table (Around line 1131)**

**Find this line:**
```jsx
{ordersAnalytics?.orders && ordersAnalytics.orders.length > 0 ? (
  ordersAnalytics.orders.map((order) => (
    <tr key={order.orderId}>
```

**Replace the entire `<tr>...</tr>` block with:**
```jsx
{ordersAnalytics?.orders && ordersAnalytics.orders.length > 0 ? (
  ordersAnalytics.orders.map((order) => (
    <ExpandableOrderRow
      key={order.orderId}
      order={order}
      isExpanded={expandedOrders.has(order.orderId)}
      onToggle={toggleOrderExpand}
      onStatusChange={handleUpdateOrderStatus}
    />
  ))
```

---

### **Step 6: Update Returns View (Around line 1317)**

**Find:**
```jsx
{activeView === 'returns' && (
  <div className="returns-view">
    <div className="view-header">
      <h2>↩️ Return Requests</h2>
```

**Replace the ENTIRE returns section (from `{activeView === 'returns' &&` to its closing `)}`) with:**

```jsx
{activeView === 'returns' && (
  <ReturnsView
    returnRequests={returnRequests}
    onApprove={handleApproveReturn}
    onReject={handleRejectReturn}
  />
)}
```

---

## ✅ Save and Test!

1. Save the file
2. Refresh admin page
3. Click Orders → Click any row → See items!
4. Click Returns → See requests!

---

## 🆘 If You Get Stuck

Just tell me which step and I'll help!
