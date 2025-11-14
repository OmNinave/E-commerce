# 🔧 Admin Panel Troubleshooting Guide

## Issue: Blank White Page on Admin Route

### Step 1: Check Browser Console

1. Open your site: `https://ecommercefront1.netlify.app/admin`
2. Press **F12** (or Right-click → Inspect)
3. Go to **Console** tab
4. Look for **red errors**

**Common errors you might see:**
- `Failed to fetch` - API connection issue
- `CORS policy` - Backend CORS not configured
- `REACT_APP_API_URL is not defined` - Environment variable missing
- `Cannot read property...` - JavaScript error

### Step 2: Verify Netlify Environment Variable

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click on your site: `ecommercefront1`
3. Go to **Site settings** → **Environment variables**
4. Verify `REACT_APP_API_URL` exists and equals:
   ```
   https://ecommerce-backend-tvss.onrender.com
   ```
5. If missing or wrong, update it and **trigger a new deploy**

### Step 3: Test Backend API

Open in browser:
```
https://ecommerce-backend-tvss.onrender.com/api/products
```

**Expected:** JSON data with products
**If error:** Backend might be down or CORS issue

### Step 4: Check Render Backend Logs

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on `ecommerce-backend`
3. Go to **Logs** tab
4. Look for errors or CORS issues

### Step 5: Verify CORS Configuration

In Render, check `FRONTEND_URL` environment variable:
- Should be: `https://ecommercefront1.netlify.app`
- No trailing slash!

## Quick Fixes

### Fix 1: Update Environment Variable in Netlify

1. Netlify Dashboard → Your Site
2. Site settings → Environment variables
3. Add/Update: `REACT_APP_API_URL` = `https://ecommerce-backend-tvss.onrender.com`
4. Deploys → Trigger deploy → Deploy site

### Fix 2: Clear Browser Cache

1. Press **Ctrl + Shift + Delete**
2. Clear cached images and files
3. Reload page: `https://ecommercefront1.netlify.app/admin`

### Fix 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for failed requests (red)
5. Check if API calls are being made

## Expected Behavior

When admin page loads correctly:
1. Shows "Loading Admin Dashboard..." briefly
2. Then shows Admin Login form
3. After login, shows Admin Dashboard

If you see a blank page, there's likely a JavaScript error preventing React from rendering.

