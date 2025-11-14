# 🛒 E-Commerce Platform

A modern, full-stack e-commerce platform built with React and Node.js, featuring a complete product catalog, shopping cart, user authentication, and comprehensive admin dashboard.

![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🎨 Frontend Features
- **Product Catalog**: Browse products with search and filter capabilities
- **Product Details**: Comprehensive product information pages
- **Shopping Cart**: Add, remove, and manage cart items
- **Checkout Process**: Complete order placement workflow
- **User Authentication**: Secure login and registration system
- **User Dashboard**: Personal account management
- **Responsive Design**: Mobile-first, works on all devices
- **Currency Conversion**: Multi-currency support
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

### 🔧 Admin Features
- **Admin Dashboard**: Comprehensive analytics and statistics
- **Product Management**: Add, edit, and manage products
- **Order Management**: View and track all orders
- **User Management**: Manage user accounts
- **Analytics**: Revenue charts, sales statistics, and reports
- **Real-time Data**: Live updates on orders and sales

### 🚀 Backend Features
- **RESTful API**: Complete API for all operations
- **User Authentication**: Secure login with session management
- **Order Processing**: Complete order creation and management
- **Database Management**: JSON-based database system
- **CORS Support**: Configured for cross-origin requests
- **Error Handling**: Comprehensive error handling

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **React Router 6.20.0** - Routing
- **React Context API** - State management
- **Chart.js / Recharts** - Data visualization
- **CSS3** - Styling with modern features

### Backend
- **Node.js 18.x** - Runtime environment
- **Express.js 4.21.2** - Web framework
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **JSON Database** - File-based data storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **npm** (v8.0.0 or higher)
- **Git** (for version control)

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omninave28/Ecommerce.git
   cd Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate unified database** (if not already present)
   ```bash
   cd db
   node generate_unified_db.js
   cd ..
   ```

### Running Locally

#### Start Backend Server

```bash
# Option 1: Using npm script
npm run admin-server

# Option 2: Direct command
cd db
node admin_server.js
```

The backend server will start on `http://localhost:5000`

#### Start Frontend Development Server

```bash
npm start
```

The frontend will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 📁 Project Structure

```
ecomerce/
├── public/                 # Static files
│   ├── index.html         # Main HTML file
│   ├── admin.html         # Admin HTML file
│   └── _redirects         # Netlify redirects
├── src/                    # Source code
│   ├── admin/             # Admin components
│   │   ├── AdminApp.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── AdminLogin.jsx
│   ├── components/        # React components
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Navigation.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── ProductList.jsx
│   │   └── Register.jsx
│   ├── context/          # Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── CurrencyContext.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── styles/           # CSS files
│   ├── App.jsx           # Main App component
│   └── index.js          # Entry point
├── db/                   # Backend files
│   ├── admin_server.js   # Express server
│   ├── admin_database.json
│   ├── unified_database.json
│   └── generate_unified_db.js
├── build/                # Production build (generated)
├── package.json          # Dependencies
├── netlify.toml          # Netlify configuration
└── README.md             # This file
```

## 🔐 Environment Variables

### Frontend (Netlify)

Create a `.env` file in the root directory or set in Netlify dashboard:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production, set to your backend URL:
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Backend (Render)

Set these in Render dashboard:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-netlify-site.netlify.app
```

## 🌐 Deployment

This project is configured for deployment on:
- **Frontend**: [Netlify](https://netlify.com)
- **Backend**: [Render](https://render.com)

### Quick Deployment Guide

For detailed deployment instructions, see:
- **[START_HERE.md](./START_HERE.md)** - Choose your deployment guide
- **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Full step-by-step guide
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick deployment steps
- **[VISUAL_DEPLOYMENT_GUIDE.md](./VISUAL_DEPLOYMENT_GUIDE.md)** - Visual walkthrough

### Deployment Checklist

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Netlify
4. ✅ Set environment variables
5. ✅ Update CORS settings
6. ✅ Test all features

## 📚 API Endpoints

### Public Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/orders` - Create new order

### Admin Endpoints

- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify admin session
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products (admin)
- `GET /api/admin/users` - Get all users

## 👤 Admin Access

### Default Admin Credentials

For testing and demonstration purposes, you can use these default credentials to access the admin dashboard:

- **Email**: `admin@ecommerce.com`
- **Password**: `admin123`

**Note**: This is a basic demonstration website. For production use, please change these credentials.

### Accessing Admin Dashboard

1. Start the backend server: `npm run admin-server`
2. Start the frontend: `npm start`
3. Navigate to: `http://localhost:3000/admin`
4. Login with the credentials above
5. Explore the admin dashboard features:
   - Revenue analytics and charts
   - Order management
   - Product management
   - User management
   - Sales statistics

## 🧪 Testing

### Test Backend API

```bash
# Test products endpoint
curl http://localhost:5000/api/products

# Test admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}'
```

### Test Frontend

1. Start backend: `npm run admin-server`
2. Start frontend: `npm start`
3. Visit `http://localhost:3000`
4. Test all features:
   - Browse products
   - Add to cart
   - Checkout
   - Admin dashboard

## 📖 Documentation

Additional documentation available:

- **[START_HERE.md](./START_HERE.md)** - Deployment guide index
- **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)** - Command cheat sheet
- **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - Deployment readiness report

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- **Solution**: Check if port 5000 is available
- **Solution**: Verify `unified_database.json` exists in `db/` folder

**Problem**: CORS errors
- **Solution**: Update `FRONTEND_URL` in environment variables
- **Solution**: Check CORS configuration in `admin_server.js`

### Frontend Issues

**Problem**: Products not loading
- **Solution**: Verify `REACT_APP_API_URL` is set correctly
- **Solution**: Check if backend is running
- **Solution**: Check browser console for errors

**Problem**: Admin dashboard blank
- **Solution**: Verify backend URL in environment variables
- **Solution**: Check backend logs for errors
- **Solution**: Verify admin credentials

### Build Issues

**Problem**: Build fails
- **Solution**: Run `npm install` to ensure all dependencies are installed
- **Solution**: Check Node.js version (should be 18.x)
- **Solution**: Clear `node_modules` and reinstall

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Scripts

Available npm scripts:

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run admin-server  # Start backend server
```

## 🔒 Security

- Passwords are hashed using bcryptjs
- Session tokens for admin authentication
- CORS configured for allowed origins only
- Input validation on all endpoints

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Omninave28**

- GitHub: [@Omninave28](https://github.com/Omninave28)
- Repository: [Ecommerce](https://github.com/Omninave28/Ecommerce)

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- All contributors and open-source libraries used

## 📞 Support

For support, please:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [Documentation](#-documentation) files
3. Open an issue on GitHub

## 🎯 Roadmap

Future features planned:
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filters
- [ ] Multi-language support
- [ ] Dark mode theme

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ using React and Node.js
