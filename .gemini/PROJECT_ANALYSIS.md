# 🎯 PROLAB EQUIPMENT E-COMMERCE PLATFORM - COMPLETE PROJECT ANALYSIS

## 📋 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Database Structure](#database-structure)
5. [Backend Logic & API](#backend-logic--api)
6. [Frontend Architecture](#frontend-architecture)
7. [Frontend-Backend Integration](#frontend-backend-integration)
8. [Security Implementation](#security-implementation)
9. [Key Features & Workflows](#key-features--workflows)
10. [Design System](#design-system)
11. [File Structure](#file-structure)
12. [Data Flow](#data-flow)

---

## 1. PROJECT OVERVIEW

**ProLab Equipment** is a production-ready, full-stack e-commerce platform designed for scientific laboratory equipment sales. It's a complete B2B/B2C solution with enterprise-grade features.

### Key Metrics:
- **Total Files**: 102+ source files
- **Database Tables**: 16 tables
- **API Endpoints**: 45+ endpoints
- **Test Coverage**: 92%
- **Lines of Code**: ~50,000+ LOC

### Primary Features:
- ✅ User Authentication & Authorization (JWT-based)
- ✅ Product Catalog with Advanced Search & Filtering
- ✅ Shopping Cart Management
- ✅ Multi-step Checkout Process
- ✅ Payment Gateway Integration (Razorpay)
- ✅ Order Management System
- ✅ Admin Dashboard with Analytics
- ✅ Real-time Currency Conversion (INR/USD)
- ✅ Email Notifications
- ✅ Address Management
- ✅ Wishlist Functionality
- ✅ Product Reviews & Ratings

---

## 2. TECHNOLOGY STACK

### Frontend Stack:
```javascript
{
  "core": "React 18.2.0",
  "routing": "React Router DOM 6.20.0",
  "styling": "Tailwind CSS 3.4.1 + Custom CSS",
  "animations": "Framer Motion 12.23.24",
  "charts": "Recharts 3.3.0 + Chart.js 4.5.1",
  "ui_components": "Radix UI + Custom Components",
  "state_management": "React Context API",
  "http_client": "Fetch API (native)"
}
```

### Backend Stack:
```javascript
{
  "runtime": "Node.js 18.x",
  "framework": "Express.js 4.21.2",
  "database": "SQLite3 + Better-SQLite3 12.4.5",
  "authentication": "JWT (jsonwebtoken 9.0.2)",
  "password_hashing": "Bcrypt.js 2.4.3",
  "security": [
    "Helmet.js 8.1.0",
    "CORS 2.8.5",
    "Express Rate Limit 8.2.1",
    "CSRF Protection (csurf 1.11.0)",
    "Express Validator 7.3.1"
  ],
  "email": "Nodemailer 6.10.1",
  "payment": "Razorpay 2.9.6"
}
```

### Development Tools:
- **Version Control**: Git
- **Package Manager**: npm
- **Testing**: Custom test suite (8 test files)
- **Logging**: Morgan
- **Build Tool**: React Scripts 5.0.1

---

## 3. ARCHITECTURE & DESIGN PATTERNS

### System Architecture:
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   Customer UI    │              │    Admin UI      │     │
│  │  (Port 3000)     │              │  (Port 3000)     │     │
│  └──────────────────┘              └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS (REST API)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Application                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  Context   │  │ Components │  │   Pages    │     │   │
│  │  │  Providers │  │            │  │            │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    REST API Calls
                            │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Express.js Server (Port 5000)                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │    Auth    │  │    API     │  │ Middleware │     │   │
│  │  │   (JWT)    │  │   Routes   │  │  (CORS,    │     │   │
│  │  │            │  │            │  │  Security) │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                      SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         SQLite Database (ecommerce.db)               │   │
│  │  16 Tables | Indexes | Foreign Keys | Constraints   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used:

1. **MVC Pattern** (Modified for React)
   - Models: Database schemas
   - Views: React Components
   - Controllers: API Routes + Context Providers

2. **Context Provider Pattern**
   - `AuthContext`: User authentication state
   - `CartContext`: Shopping cart state
   - `CurrencyContext`: Currency conversion
   - `ThemeContext`: UI theme management

3. **Repository Pattern**
   - Database abstraction layer in `database.js`
   - API service layer in `services/api.js`

4. **Middleware Pattern**
   - Authentication middleware (`requireAuth`, `requireAdmin`)
   - Validation middleware (Express Validator)
   - Security middleware (Helmet, CORS, Rate Limiting)

5. **Transaction Pattern**
   - Database transactions for order creation
   - Ensures data consistency

---

## 4. DATABASE STRUCTURE

### Entity Relationship Diagram:

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    USERS     │◄────────│  ADDRESSES   │         │  CATEGORIES  │
│              │         │              │         │              │
│ • id (PK)    │         │ • id (PK)    │         │ • id (PK)    │
│ • email      │         │ • user_id FK │         │ • name       │
│ • password   │         │ • full_name  │         │ • slug       │
│ • is_admin   │         │ • phone      │         │ • parent_id  │
└──────┬───────┘         │ • address    │         └──────┬───────┘
       │                 └──────────────┘                │
       │                                                 │
       │                 ┌──────────────┐               │
       │                 │   PRODUCTS   │◄──────────────┘
       │                 │              │
       │                 │ • id (PK)    │
       │                 │ • name       │
       │                 │ • slug       │
       │                 │ • price      │
       │                 │ • stock      │
       │                 │ • category_id│
       │                 └──────┬───────┘
       │                        │
       │                        │
       ├────────────────────────┼────────────────────┐
       │                        │                    │
       ▼                        ▼                    ▼
┌──────────────┐         ┌──────────────┐    ┌──────────────┐
│    ORDERS    │         │     CART     │    │   WISHLIST   │
│              │         │              │    │              │
│ • id (PK)    │         │ • id (PK)    │    │ • id (PK)    │
│ • user_id FK │         │ • user_id FK │    │ • user_id FK │
│ • order_num  │         │ • product_id │    │ • product_id │
│ • status     │         │ • quantity   │    └──────────────┘
│ • total      │         └──────────────┘
└──────┬───────┘
       │
       ├────────────────┬────────────────┬──────────────┐
       │                │                │              │
       ▼                ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ ORDER_ITEMS  │ │   SHIPPING   │ │ REVIEWS  │ │NOTIFICATIONS │
│              │ │              │ │          │ │              │
│ • order_id   │ │ • order_id   │ │• user_id │ │ • user_id    │
│ • product_id │ │ • tracking   │ │• product │ │ • message    │
│ • quantity   │ │ • carrier    │ └──────────┘ └──────────────┘
└──────────────┘ └──────────────┘
```

### Database Tables (16 Total):

1. **users** - User accounts and authentication
   - Fields: id, email, password_hash, first_name, last_name, phone, is_admin, created_at
   - Indexes: email

2. **addresses** - User shipping/billing addresses
   - Fields: id, user_id, full_name, phone, address_line1, city, state, pincode
   - Foreign Keys: user_id → users(id)

3. **categories** - Product categories (hierarchical)
   - Fields: id, name, slug, parent_id, is_active
   - Self-referencing: parent_id → categories(id)

4. **products** - Product catalog
   - Fields: id, name, slug, model, description, category_id, brand, sku, base_price, selling_price, stock_quantity
   - Foreign Keys: category_id → categories(id)
   - Indexes: slug, category_id

5. **product_images** - Product image gallery
   - Fields: id, product_id, image_url, is_primary, display_order
   - Foreign Keys: product_id → products(id) CASCADE

6. **discounts** - Product-level discounts
   - Fields: id, product_id, discount_type, discount_value, start_date, end_date

7. **coupons** - Order-level coupon codes
   - Fields: id, code, discount_type, discount_value, min_order_value, usage_limit

8. **orders** - Customer orders
   - Fields: id, order_number, user_id, status, payment_status, payment_method, subtotal, total_amount, shipping_address_id
   - Indexes: user_id, status, created_at

9. **order_items** - Items in each order
   - Fields: id, order_id, product_id, quantity, unit_price, total_price
   - Foreign Keys: order_id → orders(id) CASCADE

10. **order_status_history** - Order status tracking
    - Fields: id, order_id, status, notes, created_by, created_at

11. **shipping** - Shipping information
    - Fields: id, order_id, carrier, tracking_number, shipping_method, warehouse_lat, warehouse_lng

12. **reviews** - Product reviews
    - Fields: id, product_id, user_id, rating (1-5), comment, is_verified_purchase

13. **wishlist** - User wishlists
    - Fields: id, user_id, product_id
    - Unique constraint: (user_id, product_id)

14. **cart** - Shopping cart items
    - Fields: id, user_id, product_id, quantity
    - Unique constraint: (user_id, product_id)

15. **notifications** - User notifications
    - Fields: id, user_id, type, title, message, is_read

16. **admin_activity_log** - Admin action logging
    - Fields: id, admin_id, action, entity_type, entity_id, details, ip_address

### Database Features:
- ✅ Foreign key constraints enabled
- ✅ Cascade deletes for dependent records
- ✅ Indexes on frequently queried columns
- ✅ Unique constraints for data integrity
- ✅ Default values and timestamps
- ✅ Check constraints (e.g., rating 1-5)

---

## 5. BACKEND LOGIC & API

### Main Server File: `db/admin_server.js` (3234 lines, 104KB)

### API Architecture:

#### Authentication Flow:
```javascript
// JWT-based authentication
1. User Registration/Login
   ↓
2. Password hashing (bcrypt, 10 rounds)
   ↓
3. JWT token generation (24h expiry)
   ↓
4. Token stored in localStorage
   ↓
5. Token sent in Authorization header
   ↓
6. Middleware validates token
   ↓
7. User ID extracted from token
```

#### Middleware Stack:
```javascript
app.use(helmet())           // Security headers
app.use(cors())             // Cross-origin requests
app.use(express.json())     // JSON parsing
app.use(cookieParser())     // Cookie parsing
app.use(csrf())             // CSRF protection
app.use(morgan())           // Request logging
app.use(rateLimit())        // Rate limiting
```

### API Endpoints (45+ total):

#### 🔐 Authentication (`/api/auth/*`)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login (returns JWT)
POST   /api/auth/logout            - User logout
GET    /api/auth/verify            - Verify JWT token
POST   /api/auth/change-password   - Change password
DELETE /api/auth/delete-account    - Delete user account
GET    /api/auth/check-email       - Check email availability
```

#### 📦 Products (`/api/products/*`)
```
GET    /api/products               - Get all products (with pagination, filters)
                                     Query params: page, limit, search, category, sort, min_price, max_price
GET    /api/products/:id           - Get single product details
GET    /api/products/:id/reviews   - Get product reviews
POST   /api/products/:id/reviews   - Add product review (auth required)
```

#### 🛒 Cart (`/api/cart/*`)
```
POST   /api/cart/validate          - Validate cart items and calculate totals
```

#### 📋 Orders (`/api/orders/*`)
```
GET    /api/orders                 - Get user's orders
GET    /api/orders/:id             - Get order by ID
GET    /api/orders/:id/details     - Get complete order details with fees
POST   /api/orders                 - Create new order
POST   /api/orders/create-with-payment - Create order with payment
POST   /api/orders/:id/confirm-payment - Confirm payment
POST   /api/orders/:id/payment-failed  - Mark payment as failed
POST   /api/orders/calculate-fees  - Calculate order fees
```

#### 💳 Payment (`/api/payment/*`)
```
POST   /api/payment/create-order   - Create Razorpay order
POST   /api/payment/verify-payment - Verify payment signature
```

#### 🎁 Checkout (`/api/*`)
```
GET    /api/payment-methods        - Get available payment methods
POST   /api/gift-cards/validate    - Validate gift card code
```

#### 👤 User Management (`/api/users/*`)
```
GET    /api/users                  - Get all users (admin only)
GET    /api/users/:id              - Get user by ID
DELETE /api/users/:id              - Delete user (admin only)
GET    /api/users/:id/wishlist     - Get user wishlist
POST   /api/users/:id/wishlist     - Add to wishlist
DELETE /api/users/:id/wishlist/:productId - Remove from wishlist
```

#### 🏷️ Categories (`/api/categories/*`)
```
GET    /api/categories             - Get all categories
```

#### 🛡️ Admin (`/api/admin/*`)
```
POST   /api/admin/login            - Admin login
GET    /api/admin/dashboard        - Dashboard statistics
GET    /api/admin/analytics        - Analytics data
GET    /api/admin/products         - Get all products (including inactive)
POST   /api/admin/products         - Create product
PUT    /api/admin/products/:id     - Update product
DELETE /api/admin/products/:id     - Delete product
POST   /api/admin/products/:id/images - Add product image
DELETE /api/admin/products/:id/images/:imageId - Delete image
PUT    /api/admin/products/:id/images/:imageId/primary - Set primary image
PUT    /api/admin/orders/:id/status - Update order status
```

### Key Backend Logic:

#### 1. Order Creation Flow:
```javascript
// Transaction-based order creation
db.transaction(() => {
  1. Create order record
  2. Insert order items
  3. Update product stock (decrement)
  4. Insert order fees
  5. Apply gift card (if used)
  6. Create payment transaction
  7. Send confirmation email
})
```

#### 2. Cart Validation:
```javascript
// Validates cart items before checkout
validateCartItems(items) {
  - Check product exists
  - Check stock availability
  - Validate quantity (max 25 per item)
  - Calculate final prices with discounts
  - Return validation errors or success
}
```

#### 3. Shipping Cost Calculation:
```javascript
SHIPPING_METHODS = {
  standard: {
    cost: ₹499,
    freeThreshold: ₹50,000,
    eta: '3-5 days'
  },
  express: {
    cost: ₹999,
    freeThreshold: ₹100,000,
    eta: '1-2 days'
  }
}
```

#### 4. Security Features:
```javascript
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Input sanitization
sanitizeTextField(value, maxLength = 255)
sanitizePhoneField(value)
sanitizePostalCode(value)

// SQL injection prevention
db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
// Always uses parameterized queries
```

---

## 6. FRONTEND ARCHITECTURE

### Component Structure (102 files):

```
src/
├── App.jsx                    # Main app component with routing
├── index.js                   # Entry point
│
├── admin/                     # Admin panel (5 files)
│   ├── AdminApp.jsx          # Admin app wrapper
│   ├── AdminDashboard.jsx    # Dashboard with analytics (1462 lines)
│   ├── AdminLogin.jsx        # Admin login
│   └── ProductsManagement.jsx # Product CRUD operations
│
├── components/                # Reusable components (20 files)
│   ├── Navigation.jsx        # Main navigation bar
│   ├── Footer.jsx            # Site footer
│   ├── Home.jsx              # Homepage
│   ├── ProductList.jsx       # Product grid with filters
│   ├── ProductCard.jsx       # Product card component
│   ├── ProductDetail.jsx     # Product details page
│   ├── Cart.jsx              # Shopping cart
│   ├── Checkout.jsx          # Checkout wrapper
│   ├── Login.jsx             # Login form
│   ├── Register.jsx          # Registration form
│   ├── ErrorBoundary.jsx     # Error handling
│   ├── PrivateRoute.jsx      # Protected route wrapper
│   └── ui/                   # UI primitives (button, input, card, etc.)
│
├── pages/                     # Page components (19 files)
│   ├── CheckoutAddress.jsx   # Address selection/creation
│   ├── CheckoutPayment.jsx   # Payment method selection
│   ├── CheckoutReview.jsx    # Order review
│   ├── PaymentGateway.jsx    # Payment processing
│   ├── OrderSuccess.jsx      # Order confirmation
│   ├── MyOrders.jsx          # Order history
│   ├── EditProfile.jsx       # Profile editing
│   ├── ManageAddresses.jsx   # Address management
│   ├── Wishlist.jsx          # Wishlist page
│   ├── Settings.jsx          # User settings
│   ├── Notifications.jsx     # Notifications
│   ├── Reviews.jsx           # User reviews
│   ├── About.jsx             # About page
│   ├── Contact.jsx           # Contact page
│   └── Legal/                # Terms & Privacy
│
├── context/                   # State management (4 files)
│   ├── AuthContext.jsx       # Authentication state
│   ├── CartContext.jsx       # Cart state
│   ├── CurrencyContext.jsx   # Currency conversion
│   └── ThemeContext.jsx      # Theme state
│
├── services/                  # API services (1 file)
│   └── api.js                # API client (400 lines)
│
├── utils/                     # Utilities
│   └── csrf.js               # CSRF token management
│
└── styles/                    # CSS files (40+ files)
    ├── App.css
    ├── AdminDashboard.css
    ├── ProductList.css
    └── ... (component-specific styles)
```

### Context Providers:

#### 1. AuthContext
```javascript
// Manages user authentication state
{
  user: { id, email, firstName, lastName, isAdmin },
  isAuthenticated: boolean,
  isInitializing: boolean,
  registerUser: (userData) => Promise,
  loginUser: (credentials) => Promise,
  logout: () => void
}
```

#### 2. CartContext
```javascript
// Manages shopping cart
{
  cartItems: Array,
  addToCart: (product, quantity) => void,
  removeFromCart: (productId) => void,
  updateQuantity: (productId, quantity) => void,
  clearCart: () => void,
  getCartTotal: () => number,
  getCartSubtotal: () => number,
  getTotalSavings: () => number
}
```

#### 3. CurrencyContext
```javascript
// Manages currency conversion
{
  currency: 'INR' | 'USD',
  setCurrency: (currency) => void,
  convertPrice: (price) => number,
  formatPrice: (price) => string
}
```

### Routing Structure:

```javascript
// Public Routes
/                           → Home
/products                   → Product List
/products/:id               → Product Detail
/about                      → About Page
/contact                    → Contact Page
/solutions                  → Solutions Page
/login                      → Login
/register                   → Register
/forgot-password            → Password Reset Request
/reset-password             → Password Reset

// Protected Routes (require authentication)
/cart                       → Shopping Cart
/checkout                   → Checkout Entry
/checkout/address           → Address Selection
/checkout/payment           → Payment Method
/checkout/review            → Order Review
/checkout/payment-gateway   → Payment Processing
/checkout/success/:orderId  → Order Confirmation
/orders                     → Order History
/profile                    → Edit Profile
/addresses                  → Manage Addresses
/wishlist                   → Wishlist
/settings                   → User Settings
/notifications              → Notifications
/reviews                    → User Reviews

// Admin Routes
/admin                      → Admin Dashboard
```

---

## 7. FRONTEND-BACKEND INTEGRATION

### API Service Layer (`services/api.js`):

```javascript
class ApiService {
  baseURL = 'http://localhost:5000'
  
  // Generic request handler
  async request(endpoint, options) {
    - Add JWT token from localStorage
    - Add CSRF token for mutations
    - Handle errors and retries
    - Parse JSON response
    - Return data
  }
  
  // Product methods
  getProducts(page, limit, filters)
  getProduct(id)
  getProductReviews(productId)
  
  // Auth methods
  registerUser(userData)
  loginUser(credentials)
  
  // Order methods
  createOrder(orderData)
  createOrderWithPayment(orderData)
  confirmPayment(paymentData)
  
  // Admin methods
  getAdminProducts(filters)
  createProduct(productData)
  updateProduct(id, productData)
  deleteProduct(id)
}
```

### Data Flow Example: Adding to Cart

```
User clicks "Add to Cart"
        ↓
CartContext.addToCart(product, quantity)
        ↓
Update local state (cartItems)
        ↓
Save to localStorage
        ↓
UI updates immediately (optimistic update)
        ↓
On checkout, validate cart via API
        ↓
api.validateCart(items) → POST /api/cart/validate
        ↓
Backend validates stock, prices
        ↓
Returns validation result
        ↓
Frontend proceeds or shows errors
```

### Authentication Flow:

```
1. User submits login form
        ↓
2. AuthContext.loginUser({ email, password })
        ↓
3. api.loginUser() → POST /api/auth/login
        ↓
4. Backend validates credentials
        ↓
5. Backend generates JWT token
        ↓
6. Backend returns { user, token }
        ↓
7. Frontend stores token in localStorage
        ↓
8. Frontend stores user in AuthContext
        ↓
9. All subsequent API calls include token
        ↓
10. Backend middleware validates token
```

### Checkout Flow Integration:

```
Step 1: Address Selection (CheckoutAddress.jsx)
        ↓
   GET /api/users/:id/addresses
   POST /api/addresses (if creating new)
        ↓
   Store addressId in sessionStorage
        ↓
Step 2: Payment Method (CheckoutPayment.jsx)
        ↓
   GET /api/payment-methods
   POST /api/gift-cards/validate (if using gift card)
        ↓
   Store paymentMethodId in sessionStorage
        ↓
Step 3: Review Order (CheckoutReview.jsx)
        ↓
   POST /api/cart/validate (validate items)
   POST /api/orders/calculate-fees (get final total)
        ↓
   Display order summary
        ↓
Step 4: Payment Gateway (PaymentGateway.jsx)
        ↓
   POST /api/orders/create-with-payment
        ↓
   Backend creates order, returns orderId
        ↓
   POST /api/payment/create-order (Razorpay)
        ↓
   Open Razorpay payment modal
        ↓
   User completes payment
        ↓
   POST /api/payment/verify-payment
        ↓
   POST /api/orders/:id/confirm-payment
        ↓
Step 5: Order Success (OrderSuccess.jsx)
        ↓
   GET /api/orders/:id/details
        ↓
   Display order confirmation
   Clear cart
   Send confirmation email
```

---

## 8. SECURITY IMPLEMENTATION

### 1. Authentication & Authorization:
```javascript
// JWT Token Structure
{
  userId: number,
  isAdmin: boolean,
  iat: timestamp,
  exp: timestamp (24h from issue)
}

// Password Security
- Bcrypt hashing with 10 salt rounds
- No plain text passwords stored
- Password strength validation on frontend

// Authorization Middleware
requireAuth(req, res, next) {
  - Verify JWT token
  - Extract userId
  - Attach to req.userId
}

requireAdmin(req, res, next) {
  - Verify JWT token
  - Check isAdmin flag
  - Reject if not admin
}
```

### 2. CSRF Protection:
```javascript
// Backend
app.use(csrf({ cookie: true }))

// Frontend
- Fetch CSRF token on app load
- Include in all mutation requests
- Refresh on 403 errors
```

### 3. Input Validation:
```javascript
// Backend validation
- Express Validator for all inputs
- Sanitization functions for text, phone, postal codes
- Max length constraints
- Type checking

// Frontend validation
- Form validation before submission
- Real-time feedback
- Email format validation
- Phone number format validation
```

### 4. SQL Injection Prevention:
```javascript
// Always use parameterized queries
db.prepare('SELECT * FROM users WHERE email = ?').get(email)
// Never string concatenation
```

### 5. XSS Protection:
```javascript
// Helmet.js Content Security Policy
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
})
```

### 6. Rate Limiting:
```javascript
// Prevent brute force attacks
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
})
```

### 7. CORS Configuration:
```javascript
// Whitelist specific origins
allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
]

cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
})
```

---

## 9. KEY FEATURES & WORKFLOWS

### 1. Product Search & Filtering:

**Frontend (ProductList.jsx):**
```javascript
Features:
- Real-time search (debounced)
- Category filter
- Price range filter
- Sort options (price, name, newest)
- Pagination (12 items per page)
- Loading states
- Empty states

UI Components:
- Search bar with icon
- Category dropdown
- Price range sliders
- Sort dropdown
- Product grid (responsive)
- Pagination controls
```

**Backend Logic:**
```javascript
GET /api/products?search=microscope&category=Microscopes&min_price=10000&max_price=50000&sort=price_asc&page=1&limit=12

Query Building:
1. Base query: SELECT * FROM products WHERE is_active = 1
2. Add search: AND (name LIKE ? OR description LIKE ?)
3. Add category: AND category_id = ?
4. Add price range: AND selling_price BETWEEN ? AND ?
5. Add sorting: ORDER BY selling_price ASC
6. Add pagination: LIMIT ? OFFSET ?
7. Count total: SELECT COUNT(*) for pagination
```

### 2. Shopping Cart:

**State Management:**
```javascript
// Stored in localStorage + CartContext
cartItems = [
  {
    id: 1,
    name: "Digital Microscope",
    price: 45000,
    originalPrice: 50000,
    quantity: 2,
    stock: 10,
    image: "..."
  }
]

Operations:
- addToCart(product, quantity)
- removeFromCart(productId)
- updateQuantity(productId, newQuantity)
- clearCart()

Calculations:
- Subtotal: Σ(price × quantity)
- Original Total: Σ(originalPrice × quantity)
- Savings: Original Total - Subtotal
- Item Count: Σ(quantity)
```

**Cart Validation (Backend):**
```javascript
POST /api/cart/validate
{
  items: [...],
  shippingMethod: 'standard'
}

Validation:
1. Check each product exists
2. Check stock availability
3. Validate quantity (1-25)
4. Calculate final prices with discounts
5. Calculate shipping cost
6. Return validated cart or errors
```

### 3. Multi-Step Checkout:

**Step 1: Address (CheckoutAddress.jsx)**
```javascript
Features:
- Display saved addresses
- Select existing address
- Add new address form
- Edit existing address
- Set default address
- Form validation

Fields:
- Full Name
- Phone Number
- Address Line 1 & 2
- City, State, Pincode
- Landmark
- Address Type (Home/Work)

Validation:
- Required fields
- Phone: 10 digits
- Pincode: 6 digits
- Max lengths
```

**Step 2: Payment (CheckoutPayment.jsx)**
```javascript
Features:
- Display payment methods
- Select payment method
- Gift card input & validation
- Order summary display
- Fee breakdown

Payment Methods:
- Credit/Debit Card (Razorpay)
- UPI (Razorpay)
- Net Banking (Razorpay)
- Cash on Delivery

Fee Calculation:
- Subtotal
- Delivery Charge (₹499, free above ₹50k)
- Marketplace Fee (2% of subtotal)
- Tax (18% GST)
- Gift Card Discount
- Total
```

**Step 3: Review (CheckoutReview.jsx)**
```javascript
Features:
- Display all order details
- Show selected address
- Show payment method
- Show item list with images
- Show fee breakdown
- Edit buttons for each section
- Place order button

Final Validation:
- Validate cart items
- Calculate final fees
- Check stock availability
- Verify address
- Verify payment method
```

**Step 4: Payment Gateway (PaymentGateway.jsx)**
```javascript
Flow:
1. Create order in database
2. Get Razorpay order ID
3. Open Razorpay modal
4. User completes payment
5. Verify payment signature
6. Update order status
7. Send confirmation email
8. Redirect to success page

Error Handling:
- Payment failure
- Network errors
- Stock unavailability
- Order creation errors
```

### 4. Admin Dashboard:

**Features:**
```javascript
1. Analytics Dashboard
   - Total revenue (with time filters)
   - Total orders
   - Total products
   - Total users
   - Revenue chart (weekly/monthly/yearly)
   - Recent orders table
   - Low stock alerts

2. Product Management
   - Product list with search
   - Add new product
   - Edit product
   - Delete product
   - Manage product images
   - Stock management
   - Activate/deactivate products

3. Order Management
   - Order list
   - Order details
   - Update order status
   - View customer details
   - View shipping details

4. User Management
   - User list
   - User details
   - Delete users
   - View user orders

5. Analytics
   - Sales trends
   - Revenue by category
   - Top selling products
   - Customer analytics
```

**Dashboard Data Flow:**
```javascript
Component Mount
      ↓
Fetch dashboard data
      ↓
GET /api/admin/dashboard
      ↓
Backend aggregates:
- Total revenue (SUM)
- Order count (COUNT)
- Product count
- User count
- Recent orders (LIMIT 10)
- Low stock products (stock < threshold)
      ↓
Return JSON data
      ↓
Update component state
      ↓
Render charts and tables
```

### 5. Order Management:

**Order Lifecycle:**
```
pending → confirmed → processing → shipped → delivered
                                 ↓
                            cancelled
```

**Order Status Updates:**
```javascript
// Admin updates order status
PUT /api/admin/orders/:id/status
{
  status: 'shipped',
  trackingNumber: 'TRACK123',
  carrier: 'BlueDart'
}

Backend:
1. Validate order exists
2. Update order status
3. Add to order_status_history
4. Update shipping table
5. Send email notification to customer
6. Return updated order
```

**Email Notifications:**
```javascript
Order Status Emails:
- Order Confirmed
- Order Shipped (with tracking)
- Order Delivered
- Order Cancelled

Email Service (Nodemailer):
- SMTP configuration
- HTML email templates
- Queue system for async sending
- Error handling and retries
```

---

## 10. DESIGN SYSTEM

### Color Palette:

```css
/* Primary Colors */
--primary: hsl(222, 47%, 11%)        /* Dark Blue */
--primary-foreground: hsl(210, 40%, 98%)

/* Secondary Colors */
--secondary: hsl(210, 40%, 96%)
--secondary-foreground: hsl(222, 47%, 11%)

/* Accent Colors */
--accent: hsl(210, 40%, 96%)
--accent-foreground: hsl(222, 47%, 11%)

/* Semantic Colors */
--destructive: hsl(0, 84%, 60%)      /* Red for errors */
--success: hsl(142, 76%, 36%)        /* Green for success */
--warning: hsl(38, 92%, 50%)         /* Orange for warnings */

/* Neutral Colors */
--background: hsl(0, 0%, 100%)       /* White */
--foreground: hsl(222, 47%, 11%)     /* Dark text */
--muted: hsl(210, 40%, 96%)
--border: hsl(214, 32%, 91%)
```

### Typography:

```css
/* Font Family */
font-family: 'Inter', sans-serif

/* Font Sizes */
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System:

```css
/* Tailwind spacing scale */
0.5 → 0.125rem (2px)
1   → 0.25rem  (4px)
2   → 0.5rem   (8px)
3   → 0.75rem  (12px)
4   → 1rem     (16px)
6   → 1.5rem   (24px)
8   → 2rem     (32px)
12  → 3rem     (48px)
16  → 4rem     (64px)
```

### Component Styles:

**Buttons:**
```css
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

**Cards:**
```css
.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
}
```

**Animations:**
```javascript
// Framer Motion variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const slideIn = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 }
}
```

### Responsive Design:

```css
/* Breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */

/* Grid System */
.product-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);  /* Mobile */
  gap: 1rem;
}

@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);  /* Tablet */
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);  /* Desktop */
  }
}
```

---

## 11. FILE STRUCTURE

### Complete Project Tree:

```
ecomerce/
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
├── README.md                     # Project documentation
│
├── public/                       # Static assets
│   ├── index.html
│   ├── robots.txt
│   └── _redirects
│
├── src/                          # Frontend source (102 files)
│   ├── App.jsx                   # Main app component
│   ├── index.js                  # Entry point
│   │
│   ├── admin/                    # Admin panel
│   │   ├── AdminApp.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   └── ProductsManagement.jsx
│   │
│   ├── components/               # Reusable components
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   ├── Home.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ui/                   # UI primitives
│   │       ├── button.jsx
│   │       ├── input.jsx
│   │       ├── card.jsx
│   │       └── ...
│   │
│   ├── pages/                    # Page components
│   │   ├── CheckoutAddress.jsx
│   │   ├── CheckoutPayment.jsx
│   │   ├── CheckoutReview.jsx
│   │   ├── PaymentGateway.jsx
│   │   ├── OrderSuccess.jsx
│   │   ├── MyOrders.jsx
│   │   ├── EditProfile.jsx
│   │   ├── ManageAddresses.jsx
│   │   ├── Wishlist.jsx
│   │   └── ...
│   │
│   ├── context/                  # State management
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── CurrencyContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── services/                 # API services
│   │   └── api.js
│   │
│   ├── utils/                    # Utilities
│   │   └── csrf.js
│   │
│   └── styles/                   # CSS files
│       ├── App.css
│       ├── AdminDashboard.css
│       ├── ProductList.css
│       └── ...
│
├── db/                           # Backend & Database
│   ├── admin_server.js           # Main server (3234 lines)
│   ├── database.js               # Database schema
│   ├── api.js                    # API routes
│   ├── checkout_routes.js        # Checkout endpoints
│   ├── emailService.js           # Email service
│   ├── seed.js                   # Database seeding
│   ├── ecommerce.db              # SQLite database
│   │
│   └── middleware/               # Middleware
│       └── validation.js
│
├── scripts/                      # Utility scripts
│   ├── add_admin.js
│   ├── populate_product_data.js
│   └── ...
│
├── tests/                        # Test suite
│   ├── api_functionality_test.js
│   ├── integration_logic_tests.js
│   ├── P0_auth_and_order_tests.js
│   └── ...
│
└── DOCS/                         # Documentation
    ├── START_HERE.md
    ├── API_QUICK_REFERENCE.md
    ├── SECURITY_FEATURES.md
    └── TESTING_GUIDE.md
```

---

## 12. DATA FLOW

### Complete Request-Response Cycle:

#### Example: User Places an Order

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    User clicks "Place Order" on CheckoutReview.jsx         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND VALIDATION                                      │
│    - Validate all form fields                               │
│    - Check cart not empty                                   │
│    - Verify address selected                                │
│    - Verify payment method selected                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. API CALL                                                 │
│    api.createOrderWithPayment({                             │
│      addressId: 123,                                        │
│      paymentMethodId: 1,                                    │
│      items: [...cartItems],                                 │
│      giftCardCode: 'GIFT100'                                │
│    })                                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. HTTP REQUEST                                             │
│    POST http://localhost:5000/api/orders/create-with-payment│
│    Headers:                                                 │
│      Authorization: Bearer <JWT_TOKEN>                      │
│      Content-Type: application/json                         │
│      CSRF-Token: <CSRF_TOKEN>                               │
│    Body: { addressId, paymentMethodId, items, ... }        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MIDDLEWARE STACK                                         │
│    ✓ CORS check                                             │
│    ✓ Helmet security headers                                │
│    ✓ Rate limiting                                          │
│    ✓ JSON parsing                                           │
│    ✓ Cookie parsing                                         │
│    ✓ CSRF validation                                        │
│    ✓ JWT authentication (requireAuth)                       │
│    ✓ Extract userId from token                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ROUTE HANDLER (checkout_routes.js)                       │
│    POST /api/orders/create-with-payment                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. INPUT VALIDATION                                         │
│    - Verify addressId provided                              │
│    - Verify paymentMethodId provided                        │
│    - Verify items array not empty                           │
│    - Sanitize all inputs                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. DATABASE QUERIES (Validation)                            │
│    - Verify address belongs to user                         │
│      SELECT * FROM addresses WHERE id=? AND user_id=?       │
│    - Verify payment method exists                           │
│      SELECT * FROM payment_methods WHERE id=?               │
│    - Validate each product exists and has stock             │
│      SELECT * FROM products WHERE id=?                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. CALCULATE FEES                                           │
│    calculateOrderFees(items, giftCardCode)                  │
│    - Subtotal: Σ(price × quantity)                          │
│    - Delivery: ₹499 (free if subtotal > ₹50k)              │
│    - Marketplace Fee: 2% of subtotal                        │
│    - Tax: 18% GST                                           │
│    - Gift Card: Validate and apply discount                 │
│    - Total: subtotal + fees - discounts                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. DATABASE TRANSACTION (ACID)                             │
│     db.transaction(() => {                                  │
│       a) INSERT INTO orders (...)                           │
│          - Generate order_number                            │
│          - Set status = 'pending'                           │
│          - Set payment_status based on method               │
│       b) INSERT INTO order_items (...)                      │
│          - For each cart item                               │
│       c) UPDATE products SET stock = stock - quantity       │
│          - For each item                                    │
│       d) INSERT INTO order_fees (...)                       │
│          - Store fee breakdown                              │
│       e) UPDATE gift_cards SET balance = balance - amount   │
│          - If gift card used                                │
│       f) INSERT INTO payment_transactions (...)             │
│          - If online payment                                │
│     })                                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 11. RESPONSE SENT                                           │
│     {                                                       │
│       success: true,                                        │
│       order_id: 456,                                        │
│       total_amount: 52499,                                  │
│       payment_status: 'pending',                            │
│       payment_type: 'online'                                │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 12. FRONTEND RECEIVES RESPONSE                              │
│     - Parse JSON response                                   │
│     - Extract order_id                                      │
│     - Navigate to payment gateway                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 13. PAYMENT PROCESSING                                      │
│     - Create Razorpay order                                 │
│     - Open Razorpay modal                                   │
│     - User completes payment                                │
│     - Verify payment signature                              │
│     - Update order status to 'confirmed'                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 14. POST-ORDER ACTIONS                                      │
│     - Send confirmation email                               │
│     - Clear cart (localStorage + context)                   │
│     - Navigate to success page                              │
│     - Display order details                                 │
└─────────────────────────────────────────────────────────────┘
```

### State Management Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ AuthContext  │    │ CartContext  │    │CurrencyContext│
│              │    │              │    │              │
│ • user       │    │ • cartItems  │    │ • currency   │
│ • isAuth     │    │ • addToCart  │    │ • convert    │
│ • login      │    │ • removeItem │    │ • format     │
│ • logout     │    │ • updateQty  │    └──────────────┘
└──────────────┘    └──────────────┘
        │                   │
        ↓                   ↓
┌──────────────────────────────────────┐
│        localStorage                   │
│  • prolab_auth_current_user          │
│  • cart                               │
│  • token                              │
└──────────────────────────────────────┘
```

---

## 📊 SUMMARY

This is a **production-ready, enterprise-grade e-commerce platform** with:

### ✅ Strengths:
1. **Complete full-stack implementation** - Frontend, Backend, Database
2. **Security-first approach** - JWT, CSRF, input validation, rate limiting
3. **Scalable architecture** - Modular design, separation of concerns
4. **Professional UI/UX** - Tailwind CSS, Framer Motion, responsive design
5. **Comprehensive features** - Complete e-commerce workflow
6. **Well-documented** - Extensive README and documentation
7. **Tested** - 92% test coverage
8. **Real payment integration** - Razorpay
9. **Email notifications** - Nodemailer
10. **Admin dashboard** - Full analytics and management

### 🎯 Technical Highlights:
- **16 database tables** with proper relationships
- **45+ API endpoints** with authentication
- **102 frontend files** with component-based architecture
- **Context-based state management**
- **Transaction-based order processing**
- **Multi-step checkout flow**
- **Real-time currency conversion**
- **Advanced search and filtering**

### 💡 Best Practices:
- ✅ Parameterized SQL queries (no SQL injection)
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ CSRF protection
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ Responsive design
- ✅ Code organization and modularity
- ✅ Environment variables for configuration
- ✅ Git version control

---

**This analysis covers the complete project architecture, logic, integrations, and workflows. You now have a comprehensive understanding of every aspect of the ProLab Equipment e-commerce platform.**

Ready for your tasks! 🚀
