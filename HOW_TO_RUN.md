# How to Run the E-commerce Project

## Quick Start (Easiest Method)

### Option 1: Use the Batch Script (Windows)
1. Double-click `start-local.bat`
2. Wait for both servers to start
3. Open your browser:
   - **Website**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

### Option 2: Manual Setup

## Step-by-Step Instructions

### Prerequisites
- Node.js (v18.x or higher) installed
- npm (v8.0.0 or higher) installed

### Step 1: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 2: Generate/Update Database
```bash
cd db
node generate_unified_db.js
cd ..
```

**Note**: This will:
- Sync all products from `src/data/products.js`
- Preserve existing users and orders (if any)
- Generate demo data if database is empty

### Step 3: Start Backend Server
Open a terminal and run:
```bash
cd db
node admin_server.js
```

You should see:
```
✅ Server running on port 5000
✅ Unified database loaded successfully
```

**Keep this terminal open!**

### Step 4: Start Frontend Server
Open a **new terminal** and run:
```bash
npm start
```

You should see:
```
Compiled successfully!
You can now view product-catalog in the browser.
  Local:            http://localhost:3000
```

**Keep this terminal open too!**

### Step 5: Access the Application

1. **Website (Customer)**: http://localhost:3000
   - Browse products
   - Register account
   - Add to cart
   - Place orders

2. **Admin Dashboard**: http://localhost:3000/admin
   - Login with admin credentials (from `db/admin_database.json`)
   - View analytics (week/month/year)
   - Manage products
   - View users and orders

## Default Admin Credentials

Check `db/admin_database.json` for admin login credentials.

## Troubleshooting

### Port Already in Use
- **Port 5000 (Backend)**: Change `PORT` in `db/admin_server.js` or kill the process using port 5000
- **Port 3000 (Frontend)**: React will automatically use port 3001, 3002, etc.

### Database Not Found
Run: `cd db && node generate_unified_db.js`

### Dependencies Not Installed
Run: `npm install`

### Backend Not Starting
- Check if Node.js is installed: `node --version`
- Check if port 5000 is available
- Check `db/unified_database.json` exists

### Frontend Not Starting
- Check if dependencies are installed: `npm install`
- Check if port 3000 is available
- Clear cache: `npm start -- --reset-cache`

## What Happens When You Run

1. **Backend Server** (`db/admin_server.js`):
   - Loads `unified_database.json`
   - Starts API server on port 5000
   - Handles all API requests from frontend and admin

2. **Frontend Server** (`npm start`):
   - Starts React development server
   - Serves website on port 3000
   - Connects to backend API automatically

3. **Database** (`unified_database.json`):
   - Single source of truth
   - Updated in real-time when users register or place orders
   - Used by both website and admin dashboard

## Testing the Setup

### Test Website
1. Go to http://localhost:3000
2. Browse products
3. Register a new account
4. Add items to cart
5. Checkout (creates order in database)

### Test Admin Dashboard
1. Go to http://localhost:3000/admin
2. Login with admin credentials
3. View analytics (should show your test order)
4. Check products list
5. View users (should show your test account)

## Stopping the Servers

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
- **Batch Script**: Close the command windows

## Next Steps

- ✅ Database is ready
- ✅ Backend is running
- ✅ Frontend is running
- ✅ Everything is connected

You can now:
- Test user registration
- Test order creation
- View analytics in admin dashboard
- See real-time updates in the database

