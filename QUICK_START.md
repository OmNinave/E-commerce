# 🚀 Quick Start - Run Locally

## ✅ Fastest Way (Windows)

### Step 1: Double-click `start-local.bat`

That's it! The script will:
1. ✅ Check/generate database
2. ✅ Start backend server (port 5000)
3. ✅ Start frontend server (port 3000)

### Step 2: Wait for servers to start

- Backend: http://localhost:5000
- Frontend: http://localhost:3000 (opens automatically)
- Admin: http://localhost:3000/admin

---

## 🔧 Manual Method (If batch file doesn't work)

### Step 1: Generate Database (First time only)

```bash
cd db
node generate_unified_db.js
cd ..
```

### Step 2: Start Backend Server

**Open Terminal 1:**
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

### Step 3: Start Frontend Server

**Open Terminal 2 (new terminal):**
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view product-catalog in the browser.

  Local:            http://localhost:3000
```

**Browser opens automatically!**

---

## 🧪 Test the Application

### 1. Test Frontend
- Visit: http://localhost:3000
- Click "Products" → Should show all products
- Click any product → Should show details
- Add to cart → Should work

### 2. Test User Registration
- Click "Create Account" (or go to `/register`)
- Fill form:
  - Full Name: Test User
  - Email: test@example.com
  - Password: test123
  - Confirm Password: test123
- Click "Create Account"
- ✅ Should redirect to products page

### 3. Test User Login
- Click "Sign Out" (if logged in)
- Click "Sign In" (or go to `/login`)
- Enter:
  - Email: test@example.com
  - Password: test123
- Click "Sign In"
- ✅ Should login successfully

### 4. Test Order Creation
- Make sure you're logged in
- Add items to cart
- Go to Cart page
- Click "Proceed to Checkout"
- ✅ Should create order and show confirmation

### 5. Test Admin Dashboard
- Go to: http://localhost:3000/admin
- Login with:
  - Email: `admin@ecommerce.com`
  - Password: `admin123`
- ✅ Should see dashboard with analytics

---

## 🔍 Verify Database Updates

### After User Registration:
1. Register a new user
2. Go to admin dashboard
3. Click "Users" tab
4. ✅ New user should appear

### After Order Creation:
1. Create an order
2. Go to admin dashboard
3. Refresh page
4. ✅ Should see:
   - User count increased
   - Order count increased
   - Revenue increased
   - Analytics updated

---

## ⚠️ Troubleshooting

### Problem: Port 5000 Already in Use
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Problem: Port 3000 Already in Use
**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace <PID> with actual PID)
taskkill /PID <PID> /F

# Or use different port
set PORT=3001
npm start
```

### Problem: Database Not Found
**Solution:**
```bash
cd db
node generate_unified_db.js
cd ..
```

### Problem: npm install Failed
**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: Backend Not Starting
**Solution:**
1. Check if Node.js is installed: `node --version`
2. Check if database exists: `db/unified_database.json`
3. Check backend logs for errors
4. Verify port 5000 is available

### Problem: Frontend Not Starting
**Solution:**
1. Check if npm is installed: `npm --version`
2. Run: `npm install`
3. Check frontend logs for errors
4. Verify port 3000 is available

### Problem: Products Not Loading
**Solution:**
1. Check backend is running (http://localhost:5000)
2. Test API: http://localhost:5000/api/products
3. Check browser console for errors
4. Verify API URL in `src/services/api.js`

### Problem: Cannot Create Order
**Solution:**
1. Make sure you're logged in
2. Check backend is running
3. Check browser console for errors
4. Verify user ID exists in database

---

## 📋 Checklist

Before testing:
- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Database generated (`db/unified_database.json` exists)
- [ ] Dependencies installed (`npm install`)

After starting:
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Browser opens to http://localhost:3000
- [ ] Products page loads
- [ ] User can register
- [ ] User can login
- [ ] User can create order
- [ ] Admin dashboard works

---

## 🎯 Quick Test Commands

### Test Backend API:
```bash
# Test products endpoint
curl http://localhost:5000/api/products

# Test single product
curl http://localhost:5000/api/products/tit712
```

### Test Frontend:
```bash
# Open in browser
start http://localhost:3000

# Open admin dashboard
start http://localhost:3000/admin
```

---

## 📝 Notes

1. **Keep both terminals open** - Backend and frontend need to run simultaneously
2. **Backend first** - Start backend before frontend
3. **Database** - Must exist before starting backend
4. **Ports** - Default ports are 5000 (backend) and 3000 (frontend)
5. **Environment** - No environment variables needed for local development

---

## ✅ Success Indicators

### Backend Running:
- Terminal shows: `✅ Admin API server running on port 5000`
- Visit: http://localhost:5000/api/products (should return JSON)

### Frontend Running:
- Terminal shows: `Compiled successfully!`
- Browser opens to: http://localhost:3000
- Products page loads with products

### Everything Working:
- ✅ Products load from database
- ✅ User registration saves to database
- ✅ Order creation saves to database
- ✅ Admin dashboard shows live data
- ✅ Analytics update in real-time

---

## 🚀 Next Steps

After local testing works:
1. Test all features
2. Verify database updates
3. Check admin dashboard
4. Commit changes to Git
5. Push to GitHub
6. Deploy to production

---

## 📞 Need Help?

1. Check `LOCAL_SETUP_GUIDE.md` for detailed instructions
2. Check browser console for errors
3. Check backend terminal for errors
4. Check frontend terminal for errors
5. Verify all files exist in correct locations

