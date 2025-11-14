# Unified Database System Guide

## Overview

The e-commerce project now uses a **single unified database** (`db/unified_database.json`) that serves as the **single source of truth** for both the website and admin dashboard. This ensures complete data consistency and real-time updates across the entire application.

## Database Structure

The unified database contains four main collections:

### 1. Products (`products`)
- **Source**: Synced from `src/data/products.js`
- **Fields**: All product details including:
  - Basic info: `id`, `name`, `category`, `price`, `originalPrice`
  - Inventory: `currentQuantity`, `totalSold`
  - Details: `overview`, `features`, `specifications`, `applications`, `operation`, `advantages`, `considerations`, `compliance`, `commitment`
  - Media: `image`
- **Auto-sync**: Products are automatically synced from `products.js` when you run the database generator

### 2. Users (`users`)
- **Fields**:
  - `id`: Unique user identifier
  - `name`: Full name
  - `email`: Email address (normalized to lowercase)
  - `password`: Hashed password (SHA-256)
  - `registrationDate`: Date when account was created (YYYY-MM-DD)
  - `accountCreatedDate`: Same as registrationDate (for analytics)
  - `lastLoginDate`: Last login timestamp (YYYY-MM-DD)
  - `isNewUser`: Boolean flag for new users (within 30 days)
- **Real-time Updates**: New user registrations are automatically added via `/api/auth/register`

### 3. Orders (`orders`)
- **Fields**:
  - `orderId`: Unique order identifier (format: ORD000001)
  - `userId`: Reference to user who placed the order
  - `userName`: User's name (for quick reference)
  - `userEmail`: User's email (for quick reference)
  - `orderDate`: Order date (YYYY-MM-DD) - **Critical for analytics**
  - `status`: Order status (completed, processing, shipped)
  - `totalAmount`: Total order value
  - `items`: Array of ordered items with `productId`, `productName`, `quantity`, `price`, `subtotal`
- **Real-time Updates**: New orders are automatically added via `/api/orders` when users checkout

### 4. Purchase History (`purchaseHistory`)
- **Fields**:
  - `orderId`: Reference to the order
  - `userId`: Reference to the user
  - `productId`: Reference to the product
  - `productName`: Product name (for quick reference)
  - `purchaseDate`: Purchase date (YYYY-MM-DD) - **Critical for analytics**
  - `quantity`: Quantity purchased
  - `price`: Price per unit at time of purchase
- **Purpose**: Used for analytics calculations (revenue, top products, time-based analysis)

## Database Operations

### Generating/Updating the Database

Run the generator script to sync products from `products.js`:

```bash
cd db
node generate_unified_db.js
```

**What it does:**
- ✅ **Preserves existing users** - Real user registrations are kept
- ✅ **Preserves existing orders** - Real orders are kept
- ✅ **Syncs products** - Updates products from `products.js` while preserving sales data
- ✅ **Generates demo data** - Only if database is empty (for initial setup)

### Data Preservation

The generator is **smart** - it will:
- **Keep all existing users** (real registrations from live site)
- **Keep all existing orders** (real purchases from live site)
- **Update products** from `products.js` while preserving `totalSold` and `currentQuantity`
- **Only generate demo data** if the database is completely empty

## Real-Time Data Flow

### User Registration Flow
1. User fills registration form on website
2. Frontend calls `POST /api/auth/register`
3. Backend adds new user to `unified_database.json`
4. User data immediately available in admin dashboard

### Order Creation Flow
1. User adds items to cart and checks out
2. Frontend calls `POST /api/orders` with order data
3. Backend:
   - Creates new order in `orders` array
   - Adds items to `purchaseHistory`
   - Updates product `totalSold` and `currentQuantity`
   - Saves to `unified_database.json`
4. Order immediately appears in admin analytics

### Product Display Flow
1. Website fetches products via `GET /api/products`
2. Admin dashboard fetches products via `GET /api/admin/products`
3. Both use the same `unified_database.json` source
4. Products shown are always in sync

## Analytics Support

The database structure fully supports time-based analytics:

### Week/Month/Year Analytics
- **Week**: Filters by current week (Sunday to Saturday)
- **Month**: Filters by current month
- **Year**: Filters by current year

### Analytics Data Points
- **Revenue**: Calculated from `purchaseHistory` (price × quantity)
- **User Traffic**: Unique users from `purchaseHistory`
- **New Users**: Users registered in selected time period
- **Top Products**: Sorted by quantity sold
- **Category Sales**: Aggregated by product category
- **Time-based Charts**: Daily (week), Weekly (month), Monthly (year)

### Timestamps Used
- `purchaseDate` in `purchaseHistory` - For sales analytics
- `orderDate` in `orders` - For order analytics
- `registrationDate` / `accountCreatedDate` in `users` - For user growth analytics
- `lastLoginDate` in `users` - For user activity analytics

## API Endpoints

### Public Endpoints (Website)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/orders` - Create new order

### Admin Endpoints (Dashboard)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/analytics?timeRange=week|month|year` - Get analytics
- `GET /api/admin/products` - Get all products with sales data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/purchases` - Get purchase history

## Connection Points

### Website Connection
- **File**: `src/services/api.js`
- **Base URL**: `process.env.REACT_APP_API_URL || 'http://localhost:5000'`
- **Components Using API**:
  - `ProductList.jsx` - Fetches products
  - `ProductDetail.jsx` - Fetches single product
  - `AuthContext.jsx` - User registration/login
  - `Cart.jsx` - Order creation

### Admin Dashboard Connection
- **File**: `src/admin/AdminApp.jsx`
- **Base URL**: `process.env.REACT_APP_API_URL || 'http://localhost:5000'`
- **Components Using API**:
  - `AdminDashboard.jsx` - Analytics, products, users
  - `AdminLogin.jsx` - Admin authentication

### Backend Connection
- **File**: `db/admin_server.js`
- **Database**: `db/unified_database.json`
- **Functions**:
  - `loadUnifiedDb()` - Load database
  - `saveUnifiedDb(data)` - Save database
  - `loadMainDb()` - Alias for `loadUnifiedDb()`

## Benefits

1. **Single Source of Truth**: One database for everything
2. **Real-Time Updates**: Changes reflect immediately in both website and admin
3. **Data Consistency**: No conflicts between different data sources
4. **Analytics Ready**: All timestamps and fields needed for analytics
5. **Data Preservation**: Real user/order data is never lost
6. **Easy Product Sync**: Products automatically sync from `products.js`

## Maintenance

### Adding New Products
1. Add product to `src/data/products.js`
2. Run `node db/generate_unified_db.js`
3. Product appears in both website and admin

### Viewing Database
The database is a JSON file, so you can:
- Open `db/unified_database.json` in any text editor
- Use JSON viewers for better formatting
- Query via backend API endpoints

### Backup
Before making changes, backup `unified_database.json`:
```bash
cp db/unified_database.json db/unified_database.json.backup
```

## Summary

✅ **One Database** - `unified_database.json`  
✅ **Connected to Website** - Via API service  
✅ **Connected to Admin** - Via API service  
✅ **Real-Time Updates** - User registrations and orders update immediately  
✅ **Analytics Ready** - Week/month/year filtering supported  
✅ **Data Preservation** - Existing data is never lost  
✅ **Product Sync** - Auto-syncs from `products.js`

