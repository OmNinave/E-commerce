# 🔍 Debugging 403 Error - Return/Replace Requests

## Current Issue

Getting 403 Forbidden when trying to request return/replacement.

## Root Cause Analysis

The 403 error is coming from the `requireAuth` middleware in `admin_server.js` (line 143-160).

This means **one of two things**:
1. No authentication token is being sent
2. The token is invalid/expired

## How to Debug

### Step 1: Check if Token Exists

Open browser console and run:
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token preview:', token ? token.substring(0, 50) : 'NO TOKEN');
```

### Step 2: Check the Request

The code in `MyOrders.jsx` line 119-127 should now log:
```
🔍 Replace Request Debug: {
  orderId: 50,
  hasToken: true/false,
  tokenPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  reason: "your reason"
}
```

Look for this in the browser console when you click the button.

## Solutions

### Solution 1: Re-login (Most Likely Fix)

1. **Logout** from the application
2. **Login again** to get a fresh token
3. Try the return/replace request again

### Solution 2: Check Token Storage

The token might be stored under a different key. Check:
```javascript
console.log('All localStorage keys:', Object.keys(localStorage));
console.log('token:', localStorage.getItem('token'));
console.log('adminToken:', localStorage.getItem('adminToken'));
console.log('authToken:', localStorage.getItem('authToken'));
```

### Solution 3: Manual Token Test

If you have a valid token, test it manually:
```javascript
const token = 'YOUR_TOKEN_HERE';
fetch('http://localhost:5000/api/orders/50/replace', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ reason: 'Test reason' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Expected Behavior

**If token is valid:**
- Server logs: `✅ Auth success: { userId: X, isAdmin: false }`
- Response: 200 OK with success message

**If no token:**
- Server logs: `❌ Auth failed: No valid authorization header`
- Response: 401 Unauthorized

**If invalid token:**
- Server logs: `❌ Auth failed: Invalid token`
- Response: 401 Unauthorized

**If wrong user:**
- Server logs: Auth succeeds but order check fails
- Response: 403 Forbidden with "Unauthorized" message

## Quick Fix

**99% of the time, the fix is:**

1. Open `http://localhost:3000`
2. Click "Logout"
3. Click "Login"
4. Enter credentials
5. Try return/replace again

The token likely expired (24h expiry) or wasn't saved properly during initial login.

## Next Steps

1. Try the re-login solution
2. Check browser console for the debug logs
3. Report back what you see in the console
