# 📚 API Quick Reference Guide

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890"
}
```

### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {...},
  "token": "jwt_token_here"
}
```

### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@ecommerce.com",
  "password": "admin123"
}
```

---

## 🛍️ Products

### Get All Products
```http
GET /products?page=1&limit=12&category=Electronics&search=laptop&sort=price_asc

Response:
{
  "success": true,
  "products": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50
  }
}
```

### Get Single Product
```http
GET /products/:id

Response:
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Product Name",
    "price": 999.99,
    "originalPrice": 1299.99,
    "discount": {...}
  }
}
```

### Get Categories
```http
GET /categories

Response:
{
  "success": true,
  "categories": [...]
}
```

---

## 🛒 Cart

### Validate Cart
```http
POST /cart/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 999.99
    }
  ],
  "shippingMethod": "standard"
}

Response:
{
  "success": true,
  "items": [...],
  "subtotal": 1999.98,
  "taxAmount": 359.99,
  "shippingCost": 0,
  "total": 2359.97
}
```

### Get User Cart
```http
GET /users/:userId/cart
Authorization: Bearer {token}
```

### Add to Cart
```http
POST /users/:userId/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /users/:userId/cart/:productId
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /users/:userId/cart/:productId
Authorization: Bearer {token}
```

---

## 📦 Orders

### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 999.99
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "1234567890",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "shippingMethod": "standard",
  "notes": "Please deliver before 5 PM"
}

Response:
{
  "success": true,
  "order": {
    "id": 123,
    "order_number": "ORD-20251130-ABC123",
    "total_amount": 2359.97,
    "status": "pending"
  }
}
```

### Get User Orders
```http
GET /users/:userId/orders
Authorization: Bearer {token}

Response:
{
  "success": true,
  "orders": [...]
}
```

### Get Order Details
```http
GET /orders/:orderId
Authorization: Bearer {token}
```

### Cancel Order
```http
PUT /orders/:orderId/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

---

## 📍 Addresses

### Get User Addresses
```http
GET /users/:userId/addresses
Authorization: Bearer {token}
```

### Add Address
```http
POST /users/:userId/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "landmark": "Near Central Park",
  "isDefault": true,
  "addressType": "Home"
}
```

### Update Address
```http
PUT /users/:userId/addresses/:addressId
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "isDefault": true
}
```

### Delete Address
```http
DELETE /users/:userId/addresses/:addressId
Authorization: Bearer {token}
```

---

## ❤️ Wishlist

### Get Wishlist
```http
GET /users/:userId/wishlist
Authorization: Bearer {token}
```

### Add to Wishlist
```http
POST /users/:userId/wishlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

### Remove from Wishlist
```http
DELETE /users/:userId/wishlist/:productId
Authorization: Bearer {token}
```

---

## 💳 Payment

### Create Payment Order
```http
POST /payment/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 2359.97,
  "currency": "INR",
  "orderId": 123
}

Response:
{
  "success": true,
  "razorpayOrderId": "order_xyz123",
  "amount": 235997,
  "currency": "INR"
}
```

### Verify Payment
```http
POST /payment/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "orderId": 123
}

Response:
{
  "success": true,
  "message": "Payment verified successfully"
}
```

---

## 👤 User Profile

### Update Profile
```http
PUT /users/:userId/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "company": "Tech Corp",
  "bio": "Software developer"
}
```

### Change Password
```http
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

---

## ⭐ Reviews

### Get Product Reviews
```http
GET /products/:productId/reviews
```

### Add Review
```http
POST /products/:productId/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product!"
}
```

---

## 🔧 Admin APIs

### Get All Orders (Admin)
```http
GET /admin/orders?status=pending&page=1&limit=20
Authorization: Bearer {admin_token}
```

### Update Order Status (Admin)
```http
PUT /admin/orders/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shipped",
  "notes": "Shipped via FedEx"
}
```

### Get Analytics (Admin)
```http
GET /admin/analytics?timeRange=month
Authorization: Bearer {admin_token}

Response:
{
  "summary": {
    "totalSales": 150000,
    "totalOrders": 250,
    "totalUserTraffic": 1500
  },
  "charts": {...},
  "topProducts": [...]
}
```

### Create Product (Admin)
```http
POST /admin/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "category_id": 1,
  "base_price": 1299.99,
  "selling_price": 999.99,
  "stock_quantity": 100,
  "sku": "PROD-001"
}
```

### Update Product (Admin)
```http
PUT /admin/products/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "selling_price": 899.99
}
```

### Delete Product (Admin)
```http
DELETE /admin/products/:id
Authorization: Bearer {admin_token}
```

---

## 💬 Chat Assistant

### Send Message
```http
POST /chat/messages
Content-Type: application/json

{
  "message": "What is your shipping policy?"
}

Response:
{
  "id": 1701234567890,
  "type": "bot",
  "text": "We offer free shipping on orders over ₹500...",
  "timestamp": "2025-11-30T20:00:00.000Z"
}
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔑 Authentication Header Format

All protected routes require JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Notes

1. All prices are in INR (Indian Rupees)
2. Dates are in ISO 8601 format
3. Pagination starts at page 1
4. Default limit is 12 items per page
5. JWT tokens expire in 24 hours
6. Rate limiting: 100 requests per 15 minutes for auth endpoints

---

**Last Updated:** 2025-11-30  
**API Version:** 1.0.0
