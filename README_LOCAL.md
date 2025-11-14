# 🚀 Quick Start - Run Locally

## Prerequisites
- Node.js 18+ installed
- npm installed

## Quick Start (Windows)

### Option 1: Use Batch File (Easiest)
```bash
# Double-click or run:
start-local.bat
```

This will:
1. Check/generate database
2. Start backend server (port 5000)
3. Start frontend server (port 3000)

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd db
node admin_server.js
```

**Terminal 2 - Frontend:**
```bash
npm start
```

## Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Dashboard:** http://localhost:3000/admin

## Test User Accounts

### Customer Account
- Register a new account on the website
- Or use: test@example.com / test123

### Admin Account
- Email: admin@ecommerce.com
- Password: admin123

## Quick Test Flow

1. **Register User:**
   - Go to http://localhost:3000/register
   - Create account
   - ✅ User saved to database

2. **Browse Products:**
   - Go to http://localhost:3000/products
   - ✅ Products load from database

3. **Add to Cart:**
   - Click "Add to Cart" on any product
   - ✅ Cart updates

4. **Create Order:**
   - Go to Cart page
   - Click "Proceed to Checkout"
   - ✅ Order saved to database

5. **Check Admin Dashboard:**
   - Go to http://localhost:3000/admin
   - Login with admin credentials
   - ✅ See updated analytics

## Troubleshooting

**Backend not starting?**
- Check if port 5000 is available
- Verify database exists: `db/unified_database.json`

**Frontend not starting?**
- Check if port 3000 is available
- Run: `npm install`

**Products not loading?**
- Check backend is running
- Check browser console for errors

**Database errors?**
- Run: `cd db && node generate_unified_db.js`

## Full Documentation

See `LOCAL_SETUP_GUIDE.md` for detailed instructions.

