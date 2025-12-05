# E-Commerce Platform

A full-stack e-commerce platform with React frontend, Node.js/Express backend, and SQLite database. Features include product management, shopping cart, checkout, order tracking, admin dashboard, and return/replace functionality.

## Features

### Customer Features
- 🛍️ Product browsing with search and filters
- 🛒 Shopping cart management
- 💳 Secure checkout with Razorpay integration
- 📦 Order tracking and history
- 🔄 Return/Replace requests
- 👤 User authentication and profiles
- ❤️ Wishlist functionality

### Admin Features
- 📊 Comprehensive analytics dashboard
- 📦 Order management with status updates
- 🏷️ Product CRUD operations
- 🔄 Return/Replace request handling
- 👥 User management
- 📈 Sales and revenue tracking
- 🏢 Warehouse and inventory management

## Tech Stack

### Frontend
- React 18
- Framer Motion (animations)
- Recharts (analytics)
- React Router
- CSS3 with modern design

### Backend
- Node.js
- Express.js
- SQLite3
- JWT Authentication
- bcryptjs (password hashing)
- CSRF protection

### Payment
- Razorpay integration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecomerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_jwt_secret_here

   # Razorpay Configuration
   RAZORPAY_MODE=test
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Frontend URL (for CORS)
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Initialize Database**
   
   The database will be created automatically on first run. To create an admin user:
   ```bash
   node create_admin_user.js
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run admin-server
   ```
   Server will run on http://localhost:5000

2. **Start the frontend** (in a new terminal)
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:3000

### Production Mode

```bash
npm run build
npm run admin-server
```

## Default Admin Credentials

After running `create_admin_user.js`:
- **Email**: admin@example.com
- **Password**: admin

⚠️ **Change these credentials in production!**

## Project Structure

```
ecomerce/
├── db/                      # Backend
│   ├── admin_server.js      # Main server file
│   ├── api.js              # Database API layer
│   ├── database.js         # Database connection
│   └── checkout_routes.js  # Checkout endpoints
├── src/                     # Frontend
│   ├── admin/              # Admin dashboard
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── styles/             # CSS files
│   └── utils/              # Utility functions
├── public/                  # Static assets
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/checkout` - Create order
- `PUT /api/orders/:id/return` - Request return
- `PUT /api/orders/:id/replace` - Request replacement

### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/return-requests` - Return requests
- `PUT /api/admin/return-requests/:id` - Update return request

## Features in Detail

### Return/Replace System
- Users can request returns for delivered orders
- Admin dashboard shows all return requests with order details
- Admins can approve/reject returns
- Status tracking throughout the process

### Admin Dashboard
- Real-time analytics with charts
- Order management with expandable details
- Product inventory management
- User management
- Return request handling

### Security
- JWT-based authentication
- Password hashing with bcryptjs
- CSRF protection
- Environment variable configuration
- Input validation

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- React team for the amazing framework
- Express.js community
- Razorpay for payment integration
- All contributors and testers
