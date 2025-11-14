# Deployment Guide - E-commerce Project

This guide will help you deploy the frontend to Netlify and backend to Render.

## Prerequisites

1. GitHub account with your code pushed
2. Netlify account (free tier works)
3. Render account (free tier works)
4. Node.js 18+ installed locally

## Step 1: Generate Unified Database

Before deploying, make sure you have the unified database generated:

```bash
cd db
node generate_unified_db.js
```

This creates `unified_database.json` with:
- 45 products with realistic prices
- 25 users from past 2 months
- 39 orders with purchase history
- Analytics-ready data

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing this project

### 2.2 Configure Backend Service

**Service Settings:**
- **Name**: `ecommerce-backend` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node db/admin_server.js`
- **Root Directory**: Leave empty (or set to project root)

**Environment Variables:**
Add these in Render dashboard:
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-netlify-site.netlify.app
```

**Important:** Replace `your-netlify-site` with your actual Netlify site URL (you'll get this after deploying frontend).

### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. **Copy the service URL** (e.g., `https://ecommerce-backend-xxxx.onrender.com`)
4. This is your backend API URL

## Step 3: Deploy Frontend to Netlify

### 3.1 Create New Site on Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Select the repository

### 3.2 Configure Build Settings

**Build Settings:**
- **Base directory**: Leave empty
- **Build command**: `npm run build`
- **Publish directory**: `build`

**Environment Variables:**
Click "Show advanced" → "New variable" and add:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**Important:** Replace `your-backend-url` with the Render backend URL from Step 2.3

### 3.3 Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. **Copy your site URL** (e.g., `https://your-site-name.netlify.app`)

## Step 4: Update CORS on Backend

After getting your Netlify URL, update the backend:

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://your-site-name.netlify.app
   ```
5. Click "Save Changes" - this will trigger a redeploy

## Step 5: Update Frontend API URL (if needed)

If you need to change the API URL after initial deployment:

1. Go to Netlify dashboard
2. Open your site → "Site settings" → "Environment variables"
3. Update `REACT_APP_API_URL` to your Render backend URL
4. Trigger a new deploy (go to "Deploys" → "Trigger deploy" → "Deploy site")

## Step 6: Verify Deployment

### Test Frontend:
1. Visit your Netlify site
2. Navigate to `/products` - should show products
3. Click on a product - should show product details
4. Add items to cart - should work

### Test Admin Dashboard:
1. Visit `https://your-netlify-site.netlify.app/admin`
2. Login with:
   - Email: `admin@ecommerce.com`
   - Password: `admin123`
3. Dashboard should show:
   - Revenue (not ₹0)
   - Quantity sold
   - Orders count
   - Charts with data

## Troubleshooting

### Admin Dashboard is Blank

**Problem:** Admin dashboard shows loading but never loads.

**Solutions:**
1. Check browser console for errors
2. Verify `REACT_APP_API_URL` is set correctly in Netlify
3. Verify backend is running (check Render logs)
4. Check CORS - ensure `FRONTEND_URL` in Render matches your Netlify URL exactly
5. Verify `unified_database.json` exists in `db/` folder on Render

### Products Not Loading

**Problem:** Frontend shows "Failed to load products"

**Solutions:**
1. Check `REACT_APP_API_URL` environment variable in Netlify
2. Verify backend is accessible: visit `https://your-backend.onrender.com/api/products`
3. Check browser console for CORS errors
4. Verify backend logs in Render dashboard

### CORS Errors

**Problem:** Browser shows CORS policy errors

**Solutions:**
1. Ensure `FRONTEND_URL` in Render matches your Netlify URL exactly (no trailing slash)
2. Check backend logs for CORS-related errors
3. Verify backend code has CORS middleware enabled

### Database Not Found

**Problem:** Backend shows "Unified database not found"

**Solutions:**
1. Ensure `unified_database.json` is committed to Git
2. Verify file exists in `db/` folder on Render
3. Check Render logs for file path errors
4. Regenerate database: `cd db && node generate_unified_db.js` and commit

## File Structure on Render

Make sure these files are in your repository:
```
db/
  ├── admin_database.json
  ├── admin_server.js
  ├── unified_database.json  ← Must exist!
  └── generate_unified_db.js
```

## Environment Variables Summary

### Render (Backend):
- `NODE_ENV=production`
- `PORT=5000` (optional, Render sets this automatically)
- `FRONTEND_URL=https://your-netlify-site.netlify.app`

### Netlify (Frontend):
- `REACT_APP_API_URL=https://your-backend.onrender.com`

## Quick Checklist

- [ ] Generated `unified_database.json`
- [ ] Committed all files to GitHub
- [ ] Deployed backend to Render
- [ ] Got Render backend URL
- [ ] Set `REACT_APP_API_URL` in Netlify
- [ ] Deployed frontend to Netlify
- [ ] Got Netlify site URL
- [ ] Updated `FRONTEND_URL` in Render
- [ ] Tested frontend - products load
- [ ] Tested admin dashboard - shows data

## Support

If you encounter issues:
1. Check Render logs: Service → Logs
2. Check Netlify build logs: Site → Deploys → Click latest deploy
3. Check browser console for errors
4. Verify all environment variables are set correctly

