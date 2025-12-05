# Admin Dashboard Improvements - Implementation Guide

## Issue: Cannot directly edit AdminDashboard.jsx due to HTML entity encoding

The file uses HTML entities (`&gt;`, `&lt;`) which makes pattern matching difficult.

## Solution: Manual Implementation Steps

### Step 1: Add Import (Line 8)
Add after `import ProductsManagement from './ProductsManagement';`:
```jsx
import OrderDetailsModal from './components/OrderDetailsModal';
```

### Step 2: Add Handlers (After line 110 - after `handleCloseModal`)
```jsx
const handleApproveReturn = async (orderId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/approve-return`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      alert('Return approved successfully');
      fetchAdminAnalytics();
    }
  } catch (error) {
    console.error('Error approving return:', error);
    alert('Failed to approve return');
  }
};

const handleRejectReturn = async (orderId, reason) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/reject-return`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    if (response.ok) {
      alert('Return rejected');
      fetchAdminAnalytics();
    }
  } catch (error) {
    console.error('Error rejecting return:', error);
    alert('Failed to reject return');
  }
};

const handleApproveReplace = async (orderId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/approve-replace`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      alert('Replacement approved successfully');
      fetchAdminAnalytics();
    }
  } catch (error) {
    console.error('Error approving replacement:', error);
    alert('Failed to approve replacement');
  }
};

const handleRejectReplace = async (orderId, reason) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/reject-replace`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    if (response.ok) {
      alert('Replacement rejected');
      fetchAdminAnalytics();
    }
  } catch (error) {
    console.error('Error rejecting replacement:', error);
    alert('Failed to reject replacement');
  }
};
```

### Step 3: Add View Button to Actions Column (Line 1140 and 1168)
After each `</select>` tag, add:
```jsx
<button 
  onClick={() => handleViewOrder(order)}
  className="action-btn view"
  style={{ padding: '4px 8px', fontSize: '12px', marginLeft: '5px' }}
>
  View
</button>
```

### Step 4: Add Modal at End of Return Statement (Before final closing tags)
Add before the last `</div>` of the return statement (around line 1470):
```jsx
{/* Order Details Modal */}
<OrderDetailsModal 
  order={selectedOrder}
  onClose={handleCloseModal}
  onApproveReturn={handleApproveReturn}
  onRejectReturn={handleRejectReturn}
  onApproveReplace={handleApproveReplace}
  onRejectReplace={handleRejectReplace}
/>
```

## Alternative: Use Browser Dev Tools
1. Open the file in VS Code
2. Use Find & Replace with regex disabled
3. Search for exact strings and manually add code blocks

## Files Created:
- ✅ `src/admin/components/OrderDetailsModal.jsx` - Complete modal component
