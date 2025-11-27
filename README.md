# 🛒 Professional E-Commerce Platform

A full-stack e-commerce application built with React, Node.js, Express, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/OmNinave/Ecommerce.git
cd Ecommerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file in root directory
cp .env.example .env
```

4. **Initialize the database**
```bash
node db/seed.js
```

5. **Start the application**

**Option 1: Using batch file (Windows)**
```bash
start-all.bat
```

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
node db/admin_server.js
```

Terminal 2 - Frontend:
```bash
npm start
```

## 📱 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000/admin

### Default Admin Credentials
- **Email:** admin@ecommerce.com
- **Password:** admin123

## 🏗️ Project Structure

```
ecomerce/
├── db/                          # Backend & Database
│   ├── admin_server.js         # Express server
│   ├── api.js                  # Database API layer
│   ├── database.js             # SQLite connection
│   ├── ecommerce.db           # SQLite database
│   ├── seed.js                # Database seeding
│   └── emailService.js        # Email functionality
├── src/                        # Frontend React App
│   ├── admin/                 # Admin panel components
│   ├── components/            # React components
│   ├── context/              # React context providers
│   ├── pages/                # Page components
│   ├── services/             # API services
│   ├── styles/               # CSS files
│   └── data/                 # Static data
├── public/                    # Public assets
├── tests/                     # Test files
└── package.json              # Dependencies
```

## 🎯 Features

### Customer Features
- ✅ Product browsing with search & filters
- ✅ Shopping cart management
- ✅ User authentication (login/register)
- ✅ Order placement & tracking
- ✅ Wishlist functionality
- ✅ Address management
- ✅ Profile management
- ✅ Product reviews
- ✅ Live chat assistant

### Admin Features
- ✅ Complete dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ User management
- ✅ Warehouse management
- ✅ Courier partner management
- ✅ Return request handling
- ✅ Support ticket system
- ✅ Loyalty program management
- ✅ Payment settlements

## 🔧 Technology Stack

### Frontend
- React 18
- React Router v6
- Context API for state management
- Recharts for analytics
- CSS3 with modern design

### Backend
- Node.js
- Express.js
- SQLite3
- JWT authentication
- bcrypt for password hashing
- Nodemailer for emails

## 📊 Database Schema

The application uses SQLite with the following main tables:
- `products` - Product catalog
- `users` - User accounts
- `orders` - Order records
- `order_items` - Order line items
- `addresses` - User addresses
- `categories` - Product categories
- `warehouses` - Warehouse locations
- `courier_partners` - Shipping partners
- `return_requests` - Product returns
- `support_tickets` - Customer support
- And more...

## 🧪 Testing

Run tests:
```bash
npm test
```

Test files are located in the `tests/` directory.

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Rate limiting on auth endpoints
- ✅ Input validation & sanitization
- ✅ SQL injection prevention

## 📝 API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get categories
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints (Require Authentication)
- `GET /api/users/:userId/profile` - Get user profile
- `GET /api/users/:userId/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/users/:userId/addresses` - Get addresses
- And more...

### Admin Endpoints (Require Admin Role)
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - View analytics
- And more...

## 🐛 Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Re-seed the database
node db/seed.js
```

### Port Already in Use
If ports 3000 or 5000 are in use:
```bash
# Kill processes on Windows
npx kill-port 3000 5000

# Or change ports in:
# - Backend: db/admin_server.js (line 18)
# - Frontend: package.json (add "PORT=3001" to start script)
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **Om Ninave** - Initial work

## 🙏 Acknowledgments

- Built as part of an internship project
- Demonstrates full-stack development capabilities
- Implements professional e-commerce workflows

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: [Your Email]

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
