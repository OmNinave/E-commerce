# E-Commerce Admin Dashboard - Development Guide

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Windows PowerShell or Command Prompt

### Setup Instructions

#### 1. **Install Dependencies**
```bash
npm install
```

#### 2. **Start Backend Server** (in one terminal)
```bash
cd db
node admin_server.js
```
The backend will run on: **http://localhost:5000**

#### 3. **Start Frontend** (in another terminal)
```bash
npm start
```
The frontend will run on: **http://localhost:3000**

---

## Project Structure

```
.
├── src/
│   ├── admin/              # Admin dashboard components
│   │   └── AdminDashboard.jsx
│   ├── components/         # Reusable React components
│   │   ├── Navigation.jsx
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   ├── context/            # React Context for state management
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── CurrencyContext.jsx
│   ├── services/           # API communication
│   │   └── api.js
│   └── styles/             # CSS files
│       └── AdminDashboard.css
├── db/
│   ├── admin_server.js     # Express backend server
│   ├── unified_database.json  # Main database file
│   └── generate_unified_db.js # Database generation script
├── public/                 # Static files
└── package.json            # Project dependencies
```

---

## Available Scripts

### Development
- **`npm start`** - Start React dev server (port 3000)
- **`npm run build`** - Create production build

### Backend
- **`cd db && node admin_server.js`** - Start backend API (port 5000)

### Testing
- **`node test_registration.js`** - Test registration endpoint

---

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Create new user account
- **POST** `/api/auth/login` - User login

### Admin Dashboard
- **GET** `/api/admin/analytics` - Get analytics data
  - Query params: `timeRange`, `year`, `month`, `week`
- **GET** `/api/admin/products` - Get all products
- **GET** `/api/admin/users` - Get all users
- **GET** `/api/admin/analytics/orders` - Get orders analytics

### Products
- **GET** `/api/products` - Get public product listing
- **GET** `/api/products/:id` - Get specific product details

---

## Admin Dashboard Features

### Header Layout
- **Left:** Dashboard title
- **Right:** Current date/time display

### Time Range Filtering
The dashboard supports three filtering modes:

#### WEEK Filter
Shows: Year dropdown → Month dropdown → Week dropdown
Example: View data for Week 3 of November 2025

#### MONTH Filter
Shows: Year dropdown → Month dropdown
Example: View data for November 2025

#### YEAR Filter
Shows: Year dropdown only
Example: View data for entire 2025

### Default Behavior
- Dashboard loads with **current period** data
- Dropdowns auto-populate with current values
- Switching filter type resets to current period
- Users can select past/future periods for historical data

---

## User Registration & Authentication

### Registration
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "success": true,
  "user": {
    "id": "user001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "registrationDate": "2025-11-15",
    "accountCreatedDate": "2025-11-15",
    "isNewUser": true,
    "lastLoginDate": "2025-11-15"
  },
  "message": "Account created successfully"
}
```

---

## Technology Stack

### Frontend
- React 18.2.0
- React Router 6.20.0
- Recharts (for charts)
- CSS3 (Glassmorphism design)

### Backend
- Express.js 4.21.2
- Node.js 18.x
- JSON file storage

### State Management
- React Context API
- React Hooks (useState, useEffect, useCallback)

---

## Key Features Implemented

✅ **Professional Header Layout** - Dashboard title on left, date/time on right
✅ **Cascading Dropdowns** - Smart filters that adapt based on time range selection
✅ **User Registration** - Complete registration flow with validation
✅ **Admin Dashboard** - Analytics, products, users, and orders management
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Beautiful UI** - Glassmorphic design with purple/pink theme
✅ **Error Handling** - Comprehensive error messages and fallbacks

---

## Terminal Configuration

The `.vscode/settings.json` file configures VS Code to use **PowerShell** as the default terminal instead of WSL. This prevents the WSL update prompt.

### If You Still See WSL Prompt:
1. Open VS Code Settings (Ctrl+,)
2. Search for "terminal.integrated.defaultProfile.windows"
3. Ensure value is set to "PowerShell"
4. Restart VS Code

---

## Common Issues & Solutions

### Backend Port Already in Use
```bash
# Kill process on port 5000
Get-Process node | Stop-Process -Force

# Then restart
cd db
node admin_server.js
```

### Frontend Compilation Errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm start
```

### Database File Missing
```bash
# Regenerate database
cd db
node generate_unified_db.js
```

---

## Development Workflow

1. **Frontend Changes** - Automatically reload with hot module replacement
2. **Backend Changes** - Requires manual restart
3. **Database Changes** - Modify `db/unified_database.json` directly or use regeneration script

---

## Next Steps & Future Improvements

### Dashboard Enhancements
- [ ] Implement cascading filters for Products, Users, Orders tabs
- [ ] Add date range preset buttons (Last Week, Last Month, Last Year)
- [ ] Export analytics as CSV/PDF

### Features to Add
- [ ] User profile customization
- [ ] Advanced search and filtering
- [ ] Notification system
- [ ] Real-time data updates with WebSockets

### Performance Optimization
- [ ] Database indexing
- [ ] API response caching
- [ ] Lazy loading for large datasets
- [ ] Code splitting for bundle optimization

---

## Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Recharts Guide](https://recharts.org)

### Debugging
- Use browser DevTools (F12) for frontend debugging
- Check `console.log` statements in browser console
- Monitor network requests in Network tab
- Backend logs appear in terminal

---

**Last Updated:** November 15, 2025
**Version:** 1.0.0
