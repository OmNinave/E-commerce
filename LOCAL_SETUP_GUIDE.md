# Local Setup Guide - Run Project Locally

## Prerequisites

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Step-by-Step Setup

### Step 1: Navigate to Project Directory

```bash
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
```

### Step 2: Generate Unified Database

First, make sure the unified database exists:

```bash
cd db
node generate_unified_db.js
```

**Expected Output:**
```
✅ Unified database generated successfully!
📦 Products: 45
👥 Users: 25
🛒 Orders: 39
📊 Purchase History Items: 118
```

### Step 3: Install Dependencies

Install all required packages:

```bash
npm install
```

**This will install:**
- React and React DOM
- React Router
- Express (for backend)
- bcryptjs
- recharts (for admin dashboard)
- Other dependencies

### Step 4: Start Backend Server

Open **Terminal 1** (or Command Prompt):

```bash
cd db
node admin_server.js
```

**Expected Output:**
```
✅ Admin API server running on port 5000
📍 Environment: development
🌐 Access at: http://localhost:5000
```

**Keep this terminal open!**

### Step 5: Start Frontend Development Server

Open **Terminal 2** (new terminal window):

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view product-catalog in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**The browser should automatically open to http://localhost:3000**

### Step 6: Test the Application

#### Test 1: Frontend (Customer Site)
1. Open browser: http://localhost:3000
2. **Home Page:** Should load successfully
3. **Products Page:** Click "Products" → Should show all products
4. **Product Detail:** Click any product → Should show details
5. **Cart:** Add items to cart → Should work

#### Test 2: User Registration
1. Click "Create Account" (or go to `/register`)
2. Fill form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
3. Click "Create Account"
4. **Expected:** Redirected to products page, logged in

#### Test 3: User Login
1. Click "Sign Out" (if logged in)
2. Click "Sign In" (or go to `/login`)
3. Enter:
   - Email: test@example.com
   - Password: test123
4. Click "Sign In"
5. **Expected:** Logged in successfully

#### Test 4: Create Order
1. Make sure you're logged in
2. Go to Products page
3. Add items to cart (click "Add to Cart")
4. Go to Cart page (click cart icon)
5. Click "Proceed to Checkout"
6. **Expected:** 
   - Order created successfully
   - Redirected to checkout confirmation
   - Order ID shown

#### Test 5: Admin Dashboard
1. Go to: http://localhost:3000/admin
2. Login with:
   - Email: admin@ecommerce.com
   - Password: admin123
3. **Expected:**
   - Dashboard loads
   - Shows revenue, orders, users
   - Charts display data
   - Products list shows
   - Users list shows

#### Test 6: Verify Database Updates
1. Create a new user registration
2. Create a new order
3. Go to admin dashboard
4. Refresh page
5. **Expected:**
   - User count increased
   - Order count increased
   - Revenue increased
   - Analytics updated

## Troubleshooting

### Issue 1: Port 5000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in db/admin_server.js
const PORT = process.env.PORT || 5001;
```

### Issue 2: Port 3000 Already in Use

**Error:** `Something is already running on port 3000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
set PORT=3001
npm start
```

### Issue 3: Database Not Found

**Error:** `Unified database not found`

**Solution:**
```bash
cd db
node generate_unified_db.js
```

### Issue 4: Cannot Connect to Backend

**Error:** `Failed to load products` or CORS errors

**Solution:**
1. Make sure backend is running on port 5000
2. Check backend terminal for errors
3. Verify `REACT_APP_API_URL` is not set (defaults to localhost:5000)
4. Check browser console for CORS errors

### Issue 5: npm install Fails

**Error:** `npm ERR!` messages

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 6: Products Not Loading

**Error:** Empty products page

**Solution:**
1. Check backend is running
2. Visit: http://localhost:5000/api/products
3. Should return JSON with products
4. Check browser console for errors
5. Verify API URL in `src/services/api.js`

## Quick Start Scripts

### Windows (PowerShell)

**Start Backend:**
```powershell
cd db
node admin_server.js
```

**Start Frontend (new terminal):**
```powershell
npm start
```

### Windows (Batch File)

Create `start-local.bat`:
```batch
@echo off
echo Starting Backend Server...
start cmd /k "cd db && node admin_server.js"
timeout /t 3
echo Starting Frontend Server...
start cmd /k "npm start"
echo Both servers are starting...
pause
```

## Environment Variables (Local)

For local development, you don't need to set environment variables. The defaults work:

- **Backend:** http://localhost:5000 (automatic)
- **Frontend API:** http://localhost:5000 (default in `src/services/api.js`)

## API Endpoints (Local)

### Public Endpoints
- `GET http://localhost:5000/api/products` - Get all products
- `GET http://localhost:5000/api/products/:id` - Get single product
- `POST http://localhost:5000/api/auth/register` - Register user
- `POST http://localhost:5000/api/auth/login` - Login user
- `POST http://localhost:5000/api/orders` - Create order

### Admin Endpoints
- `POST http://localhost:5000/api/admin/login` - Admin login
- `GET http://localhost:5000/api/admin/analytics` - Get analytics
- `GET http://localhost:5000/api/admin/products` - Get products (admin)
- `GET http://localhost:5000/api/admin/users` - Get users

## Testing Checklist

- [ ] Backend server starts on port 5000
- [ ] Frontend server starts on port 3000
- [ ] Home page loads
- [ ] Products page loads with products
- [ ] Product detail page loads
- [ ] User can register
- [ ] User can login
- [ ] User can add items to cart
- [ ] User can create order
- [ ] Admin dashboard loads
- [ ] Admin can see users
- [ ] Admin can see orders
- [ ] Admin can see analytics
- [ ] Database updates after registration
- [ ] Database updates after order creation
- [ ] Analytics update in real-time

## Next Steps

After local testing:
1. Commit all changes to Git
2. Push to GitHub
3. Deploy backend to Render
4. Deploy frontend to Netlify
5. Update environment variables
6. Test on live site

## Support

If you encounter issues:
1. Check backend terminal for errors
2. Check frontend terminal for errors
3. Check browser console for errors
4. Verify database exists: `db/unified_database.json`
5. Verify all dependencies installed: `npm install`

