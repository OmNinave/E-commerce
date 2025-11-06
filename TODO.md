# Ecommerce Project Enhancement TODO

## Information Gathered
- Current project: Pure React frontend with static product catalog
- Requirements: Add user authentication, admin dashboard with analytics, product management via Excel-like interface
- Backend needed: Node.js/Express + MongoDB for data persistence
- User flow: Registration/login for shopping, separate admin access
- Analytics: Sales overview, user analytics (monthly new users), site traffic, product/inventory management, order management, customer management
- Product addition: Excel-like interface for bulk product entry with predefined columns

## Plan
### Backend Setup
- Create Express server with MongoDB connection
- Define models: User (with role: user/admin), Product, Order
- Implement JWT authentication for users and admins
- Create API endpoints for auth, products, orders, analytics

### Frontend Authentication
- Add Login/Register components with forms
- Implement auth context for state management
- Protect shopping routes with authentication
- Add logout functionality

### Admin Dashboard
- Create admin-only routes and components
- Sales Overview: Charts for total sales, trends, top products, category breakdown
- User Analytics: Total users, active users, monthly new user charts (based on account creation dates)
- Site Traffic: Integrate Google Analytics placeholder
- Product Management: List, edit, delete products; Excel-like bulk add interface
- Order Management: View orders, update status, handle returns
- Customer Management: User list, details, order history

### Excel-like Product Addition
- Use react-data-grid or handsontable for spreadsheet interface
- Predefined columns matching product schema (name, model, category, price, etc.)
- Allow adding multiple rows (products) at once
- Validate and submit data to backend

### UI/UX Updates
- Remove admin features from user-facing pages
- Update navigation to show login/logout based on auth status
- Style admin dashboard with charts and tables

## Dependent Files to be edited
- package.json: Add backend dependencies
- src/App.jsx: Add new routes for auth and admin
- src/context/: Add AuthContext
- New backend files: server.js, models/, routes/, middleware/
- New components: Login.jsx, Register.jsx, AdminDashboard.jsx, ProductManager.jsx, Analytics.jsx, etc.
- src/data/products.js: Move to backend database

## Followup steps
- Install backend dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, etc.
- Set up MongoDB database
- Create admin CLI tool: admin-cli.js for command-line admin login that authenticates and opens admin dashboard in browser
- Test authentication flow
- Test admin dashboard features
- Test Excel-like product addition
- Deploy backend and connect to frontend
