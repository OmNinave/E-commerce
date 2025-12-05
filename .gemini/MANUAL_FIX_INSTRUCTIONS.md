# 🔧 Manual Fix Instructions - Admin Panel

## ❌ What Went Wrong
My automated scripts broke the AdminDashboard.jsx file due to HTML entity encoding issues. I've restored the file from git.

## ✅ Simple Manual Fix (5 minutes)

Instead of complex automation, here's what to do:

### **Step 1: Add Import** (Line 8)

**Find this line:**
```jsx
import ProductsManagement from './ProductsManagement';
```

**Add after it:**
```jsx
import { ExpandableOrderRow, ReturnsView } from './components/OrderComponents';
```

---

### **Step 2: Add States** (After line 101)

**Find this line:**
```jsx
const [ordersWeek, setOrdersWeek] = useState(getCurrentWeek());
```

**Add after it:**
```jsx
const [expandedOrders, setExpandedOrders] = useState(new Set());
const [returnRequests, setReturnRequests] = useState([]);
```

---

### **Step 3: Add Functions** (After line 123, after handleLogout function)

**Add these functions:**

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

const handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.ok) {
      alert('Order status updated!');
      fetchOrdersAnalytics();
      if (activeView === 'returns') {
        fetchReturnRequests();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
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
};

const handleRejectReturn = async (req) => {
  if (!window.confirm('Reject this request?')) return;
  await handleUpdateOrderStatus(req.id, 'delivered');
};
```

---

### **Step 4: Add useEffect** (After the existing useEffects around line 475)

**Add:**

```jsx
useEffect(() => {
  if (activeView === 'returns') {
    fetchReturnRequests();
  }
}, [activeView]);
```

---

### **Step 5: Update Orders Table** (Around line 1131-1157)

**Find this tbody section** (inside the orders table):

```jsx
<tbody>
  {ordersAnalytics?.orders && ordersAnalytics.orders.length > 0 ? (
    ordersAnalytics.orders.map((order) => (
      <tr key={order.orderId}>
```

**Replace the entire mapping with:**

```jsx
<tbody>
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
  ) : (
    <tr>
      <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
        No orders found
      </td>
    </tr>
  )}
</tbody>
```

---

### **Step 6: Update Returns View** (Around line 1317)

**Find:**
```jsx
{activeView === 'returns' && (
  <div className="returns-view">
```

**Replace the entire returns section with:**

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

## ✅ That's It!

Save the file and the page should work!

### **What This Gives You:**
1. ✅ Click order rows to expand and see items
2. ✅ Returns tab shows all return/replacement requests
3. ✅ Approve/Reject buttons that actually work

### **Testing:**
1. Refresh admin page (`http://localhost:3000/admin`)
2. Go to Orders → Click any row
3. Go to Returns → See requests (if any exist)

---

## 📝 Files Created:
- ✅ `src/admin/components/OrderComponents.jsx` - Ready to import

## 🚨 If You Get Stuck:
Just let me know and I'll help with the specific section!
