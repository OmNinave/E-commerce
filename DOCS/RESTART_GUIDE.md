# 🚀 Application Restart Guide

## Quick Restart Commands

### Option 1: Restart Both Backend and Frontend

#### Step 1: Start Backend Server
```bash
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
node db/admin_server.js
```

**Expected Output:**
```
Using port: 5000
✅ Database initialized successfully
Server running on port 5000
```

#### Step 2: Start Frontend (New Terminal)
```bash
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view product-catalog in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## Option 2: Using Batch File (Windows)

### Create Start Script
Create a file named `start-all.bat` in the project root:

```batch
@echo off
echo Starting E-Commerce Application...
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0" && node db/admin_server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo ✅ Application started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
```

### Run the Script
Double-click `start-all.bat` or run:
```bash
.\start-all.bat
```

---

## Option 3: Using npm Scripts

### Add to package.json
Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "admin-server": "node db/admin_server.js",
    "dev": "concurrently \"npm run admin-server\" \"npm start\""
  }
}
```

### Install Concurrently (if not installed)
```bash
npm install --save-dev concurrently
```

### Run Both Servers
```bash
npm run dev
```

---

## Troubleshooting

### Port Already in Use

#### Backend (Port 5000)
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

#### Frontend (Port 3000)
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Backend Won't Start

**Check 1: Node.js installed**
```bash
node --version
# Should show v18.x or higher
```

**Check 2: Dependencies installed**
```bash
npm install
```

**Check 3: Database file exists**
```bash
dir db\ecommerce.db
# Should show the database file
```

### Frontend Won't Start

**Check 1: Clear cache**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**Check 2: Check for errors**
```bash
npm start
# Look for error messages
```

---

## Verification Steps

### 1. Check Backend is Running
Open browser: `http://localhost:5000/api/products`

**Expected Response:**
```json
{
  "success": true,
  "products": [...],
  "pagination": {...}
}
```

### 2. Check Frontend is Running
Open browser: `http://localhost:3000`

**Expected:** Homepage loads with products

### 3. Check Backend Connection
Open browser console (F12) on frontend and check for:
```
🔄 Fetching products from API...
✅ Loaded X products from API
```

**No errors should appear**

---

## Common Issues and Fixes

### Issue 1: "Cannot find module 'express'"
**Fix:**
```bash
cd db
npm install
```

### Issue 2: "EADDRINUSE: address already in use"
**Fix:** Kill the process using the port (see Troubleshooting section)

### Issue 3: "Failed to fetch products"
**Fix:**
1. Ensure backend is running on port 5000
2. Check CORS settings in `db/admin_server.js`
3. Verify `.env` file has correct API URL

### Issue 4: "Module not found" errors
**Fix:**
```bash
npm install
npm start
```

### Issue 5: Database errors
**Fix:**
```bash
# Backup current database
copy db\ecommerce.db db\ecommerce.backup.db

# Check database integrity
node -e "const db = require('./db/database'); console.log('DB OK');"
```

---

## Environment Variables

### Check .env file
```bash
type .env
```

**Should contain:**
```env
REACT_APP_API_URL=http://localhost:5000
```

### If missing, create .env:
```bash
echo REACT_APP_API_URL=http://localhost:5000 > .env
```

---

## Clean Restart (Full Reset)

If you want to completely restart everything:

```bash
# 1. Stop all running servers (Ctrl+C in terminals)

# 2. Clear all caches
npm cache clean --force

# 3. Remove node_modules
rmdir /s /q node_modules

# 4. Reinstall dependencies
npm install

# 5. Start backend
node db/admin_server.js

# 6. Start frontend (new terminal)
npm start
```

---

## Quick Status Check

### Check if servers are running:
```bash
# Check backend
curl http://localhost:5000/api/products

# Check frontend
curl http://localhost:3000
```

### Check processes:
```bash
# List all node processes
tasklist | findstr node.exe
```

---

## Production Build

### Build for production:
```bash
npm run build
```

### Serve production build:
```bash
# Install serve globally
npm install -g serve

# Serve the build
serve -s build -l 3000
```

---

## Logs and Debugging

### Enable verbose logging:
```bash
# Backend with debug
DEBUG=* node db/admin_server.js

# Frontend with verbose
VERBOSE=true npm start
```

### Check logs:
- Backend logs: Console where `node db/admin_server.js` is running
- Frontend logs: Browser console (F12)
- Build logs: Terminal where `npm start` is running

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start Backend | `node db/admin_server.js` |
| Start Frontend | `npm start` |
| Build Production | `npm run build` |
| Install Dependencies | `npm install` |
| Check Backend | `http://localhost:5000/api/products` |
| Check Frontend | `http://localhost:3000` |
| Kill Port 5000 | `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| Kill Port 3000 | `netstat -ano \| findstr :3000` then `taskkill /PID <PID> /F` |

---

## Admin Access

### Admin Login:
- URL: `http://localhost:3000/admin`
- Email: `admin@ecommerce.com`
- Password: Check database or create admin user

### Create Admin User:
```bash
node check_user.js
```

---

## Success Indicators

✅ **Backend Running:**
- Console shows "Server running on port 5000"
- No error messages
- API responds at http://localhost:5000/api/products

✅ **Frontend Running:**
- Console shows "Compiled successfully!"
- Browser opens automatically
- No errors in browser console

✅ **Connection Working:**
- Products load on homepage
- No "Backend server not available" warnings
- Search and filters work

---

**Last Updated:** 2025-11-25
**Status:** Ready for use
