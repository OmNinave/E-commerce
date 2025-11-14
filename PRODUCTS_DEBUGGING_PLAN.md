# Products Not Showing - Debugging Plan

## 🔍 Problem Analysis

### What Changed:
1. **Before**: Products were imported directly from `src/data/products.js` as static data
2. **After**: Products are now fetched from API endpoint `/api/products`

### Why Products Might Not Show:

#### 1. Backend Server Not Running
- **Symptom**: API call fails, no products loaded
- **Check**: Is `node db/admin_server.js` running on port 5000?
- **Fix**: Start backend server

#### 2. CORS Issue
- **Symptom**: Browser console shows CORS error
- **Check**: Check browser console for CORS errors
- **Fix**: Verify CORS settings in `admin_server.js`

#### 3. API URL Mismatch
- **Symptom**: API calls going to wrong URL
- **Check**: `process.env.REACT_APP_API_URL` or default `http://localhost:5000`
- **Fix**: Ensure API URL is correct

#### 4. Network Error
- **Symptom**: Fetch fails, error in console
- **Check**: Browser DevTools Network tab
- **Fix**: Check if backend is accessible

#### 5. Empty Response
- **Symptom**: API returns empty array or wrong format
- **Check**: Check API response in Network tab
- **Fix**: Verify database has products

#### 6. Error Handling Hiding Issue
- **Symptom**: Error caught but not displayed properly
- **Check**: Check browser console for errors
- **Fix**: Improve error handling

## 🛠️ Step-by-Step Debugging

### Step 1: Check Backend Server
```bash
# Terminal 1: Start backend
cd db
node admin_server.js

# Should see:
# ✅ Server running on port 5000
# ✅ Unified database loaded successfully
```

### Step 2: Test API Directly
```bash
# Terminal 2: Test API endpoint
curl http://localhost:5000/api/products

# Should return JSON with products array
```

### Step 3: Check Browser Console
1. Open http://localhost:3000/products
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for `/api/products` request

### Step 4: Verify Database
```bash
cd db
node -e "const db = require('./unified_database.json'); console.log('Products:', db.products.length);"
```

### Step 5: Check API Response Format
- Open Network tab in DevTools
- Find `/api/products` request
- Check Response tab
- Should see: `{ success: true, products: [...] }`

## 🔧 Solutions

### Solution 1: Add Fallback to Static Products
If API fails, fall back to static import from `products.js`

### Solution 2: Improve Error Messages
Show specific error messages to user

### Solution 3: Add API Health Check
Check if backend is running before making requests

### Solution 4: Better Error Handling
Catch and display all error types

## 📋 Implementation Plan

1. ✅ Add fallback to static products import
2. ✅ Improve error messages in UI
3. ✅ Add console logging for debugging
4. ✅ Verify API endpoint is working
5. ✅ Test with backend running and not running

