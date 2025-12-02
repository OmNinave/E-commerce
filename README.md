<div align="center">

<!-- STATIC HEADER BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:003B57,100:00F0FF&height=200&section=header&text=PROLAB%20EQUIPMENT&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Enterprise-Grade%20Scientific%20E-Commerce%20Platform&descAlignY=55&descAlign=50&descSize=18" alt="ProLab Equipment" width="100%"/>

<br/>

<!-- BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/REACT-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" height="28">
  <img src="https://img.shields.io/badge/NODE.JS-18-339933?style=for-the-badge&logo=node.js&logoColor=white" height="28">
  <img src="https://img.shields.io/badge/SQLITE-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" height="28">
  <img src="https://img.shields.io/badge/STATUS-ONLINE-00F0FF?style=for-the-badge&logo=github-actions&logoColor=white" height="28">
</p>

</div>

<br/>

## 📋 Project Overview

**ProLab Equipment** is a full-stack e-commerce platform designed for the scientific and laboratory equipment market. Built with modern web technologies, it provides a seamless shopping experience for customers and powerful management tools for administrators.

### ✨ Key Features

- 🛍️ **Smart Storefront** - Advanced search, filtering, and product discovery
- 🛡️ **Admin Dashboard** - Complete inventory and order management
- 💳 **Secure Checkout** - Multi-step checkout with real-time validation
- 📊 **Analytics** - Visual sales data and customer insights
- 📱 **Mobile First** - Fully responsive glassmorphism design
- 🔒 **Enterprise Security** - JWT auth, bcrypt hashing, rate limiting

<br/>

## 🧬 Technology Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,js,html,css,tailwind,nodejs,express,sqlite,git,vscode&theme=dark" />
</div>

<br/>

## 🚀 Quick Start

### Windows (Recommended)

```powershell
# Clone the repository
git clone https://github.com/OmNinave/Ecommerce.git
cd Ecommerce

# Run the one-click launcher
./start-all.bat
```

The application will start automatically:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

### Linux / Mac

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Initialize database
node db/seed.js

# Start backend (Terminal 1)
node db/admin_server.js

# Start frontend (Terminal 2)
npm start
```

<br/>

## 📐 System Architecture

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SQLite    │
│  Database   │
└─────────────┘
```

**Flow:**
1. User interacts with React frontend
2. API requests sent to Express backend
3. JWT authentication validates requests
4. SQLite database processes queries
5. JSON responses returned to frontend

<br/>

## 📁 Project Structure

```
ecomerce/
├── db/                  # Backend & Database
│   ├── admin_server.js  # Express Server
│   ├── api.js           # Database API
│   └── ecommerce.db     # SQLite Database
├── src/                 # Frontend Application
│   ├── admin/           # Admin Panel
│   ├── components/      # React Components
│   ├── pages/           # Page Components
│   └── services/        # API Services
├── scripts/             # Utility Scripts
├── tests/               # Test Suite
└── public/              # Static Assets
```

<br/>

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt encryption
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Input Validation** - SQL injection prevention
- ✅ **CORS** - Cross-origin security
- ✅ **Helmet.js** - HTTP header security

<br/>

## 📚 Admin Credentials

For testing the admin panel:

```
Email: admin@example.com
Password: admin123
```

<br/>

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
node tests/api_functionality_test.js
```

<br/>

## 🤝 Contributing

This is an internship project. For questions or issues, please contact the development team.

<br/>

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:003B57,100:00F0FF&height=100&section=footer" width="100%"/>
  <br/>
  <b>Built with ❤️ by the ProLab Development Team</b>
  <br/>
  <sub>© 2025 ProLab Equipment. All Rights Reserved.</sub>
</div>
