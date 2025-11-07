# E-Commerce Admin Dashboard

## Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Admin Backend Server
Open a new terminal and run:
```bash
npm run admin-server
```
The API server will start on http://localhost:5000

### Step 3: Start the React App
In another terminal, run:
```bash
npm start
```
The app will open on http://localhost:3000

### Step 4: Access Admin Dashboard

**Method 1: Direct URL**
Navigate to: http://localhost:3000/admin

**Method 2: Open in New Tab**
Add this to your main site (e.g., in Footer):
```jsx
<a href="/admin" target="_blank" rel="noopener noreferrer">
  Admin Dashboard
</a>
```

### Login Credentials

**Admin Account 1:**
- Email: admin@ecommerce.com
- Password: admin123

**Admin Account 2:**
- Email: manager@ecommerce.com
- Password: admin123

**Admin Account 3:**
- Email: supervisor@ecommerce.com
- Password: admin123

## Features

✅ Secure Authentication (3 admin users only)
✅ Session Management (30-minute timeout)
✅ Dashboard Analytics
✅ Interactive Charts (Sales, Quantity, Traffic)
✅ Real-time Statistics
✅ Responsive Design
✅ Separate Admin Window
✅ Backend API with Express.js
✅ Connected to Main Database

## Security

- Password hashing with bcrypt
- Session token authentication
- CSRF protection
- Input sanitization
- No public registration

## Troubleshooting

**Server won't start:**
- Check if port 5000 is available
- Ensure Node.js is installed

**Login fails:**
- Verify admin server is running
- Check credentials
- Look for errors in browser console

**Charts not displaying:**
- Ensure database file exists (db/full_database.json)
- Check for Chart.js errors in console