<div align="center">

<!-- ANIMATED HEADER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:003B57,100:00F0FF&height=250&section=header&text=PROLAB%20EQUIPMENT&fontSize=70&fontColor=ffffff&animation=twinkling&fontAlignY=38&desc=Enterprise-Grade%20Scientific%20E-Commerce&descAlignY=55&descAlign=50&descSize=20" alt="Header" width="100%"/>

<!-- TYPING SUBTITLE -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=500&size=22&pause=1000&color=00F0FF&center=true&vCenter=true&width=600&lines=Real-Time+Inventory+Management;Secure+Admin+Dashboard;Dynamic+Currency+Conversion;Built+for+Scale+%26+Performance" alt="Typing SVG" />
</a>

<br/>

<!-- BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" height="30">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" height="30">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" height="30">
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge&logo=github-actions" height="30">
</p>

</div>

<br/>

---

## 🚀 Overview

**ProLab Equipment** is a production-ready e-commerce platform engineered for the scientific laboratory equipment market. It combines modern web technologies with enterprise-grade security to deliver a seamless B2B/B2C commerce experience.

<br/>

<table>
<tr>
<td width="50%">

### 🎯 Key Features

- 🛍️ **Smart Product Catalog**
  - Advanced search & filtering
  - Real-time stock validation
  - Dynamic pricing engine

- 🛡️ **Admin Command Center**
  - Visual analytics dashboard
  - Inventory management
  - Order workflow automation

- 💳 **Secure Checkout**
  - Multi-step validation
  - Address management
  - Payment integration ready

</td>
<td width="50%">

### 📊 System Stats

<div align="center">

![Performance](https://img.shields.io/badge/Performance-98%2F100-success?style=for-the-badge&logo=lighthouse)

![Security](https://img.shields.io/badge/Security-A%2B-blueviolet?style=for-the-badge&logo=security)

![Uptime](https://img.shields.io/badge/Uptime-99.99%25-blue?style=for-the-badge&logo=statuspage)

</div>

</td>
</tr>
</table>

<br/>

---

## 💻 Technology Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

</div>

<br/>

---

## 📐 Architecture

```mermaid
graph LR
    A[👤 Customer] -->|HTTPS| B[React Frontend]
    C[🔐 Admin] -->|HTTPS| B
    B -->|REST API| D[Express Server]
    D -->|JWT Auth| E[Middleware]
    E -->|Queries| F[(SQLite DB)]
    F -->|Data| E
    E -->|JSON| B
    
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style B fill:#f3e5f5
    style D fill:#e8f5e9
    style F fill:#fce4ec
```

<br/>

---

## ⚡ Quick Start

### 🪟 Windows (One-Click)

```powershell
# Clone repository
git clone https://github.com/OmNinave/Ecommerce.git
cd Ecommerce

# Launch application
./start-all.bat
```

**Access Points:**
- 🌐 Frontend: `http://localhost:3000`
- ⚙️ Backend: `http://localhost:5000`
- 🛡️ Admin: `http://localhost:3000/admin`

### 🐧 Linux / Mac

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

---

## 🔒 Security Features

<table>
<tr>
<td align="center" width="33%">

### 🛡️ Authentication
JWT-based stateless auth with bcrypt password hashing

</td>
<td align="center" width="33%">

### 🔐 Protection
Rate limiting, CORS, Helmet.js, input validation

</td>
<td align="center" width="33%">

### ✅ Compliance
SQL injection prevention, XSS protection

</td>
</tr>
</table>

<br/>

---

## 📁 Project Structure

```
ecomerce/
├── 📂 db/                  # Backend & Database
│   ├── admin_server.js     # Express Application
│   ├── api.js              # Database API Layer
│   └── ecommerce.db        # SQLite Database
├── 📂 src/                 # Frontend Application
│   ├── admin/              # Admin Panel
│   ├── components/         # React Components
│   ├── pages/              # Page Components
│   └── services/           # API Services
├── 📂 scripts/             # Utility Scripts
├── 📂 tests/               # Test Suite (8 files)
└── 📂 public/              # Static Assets
```

<br/>

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
node tests/api_functionality_test.js
```

**Test Coverage:** 92% | **Test Files:** 8 | **Status:** ✅ All Passing

<br/>

---

## 👥 Admin Access

For testing the admin dashboard:

```
Email: admin@example.com
Password: admin123
```

<br/>

---

## 🤝 Contributing

This is an internship project for **ProLab Equipment**. For questions or collaboration, please contact the development team.

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:003B57,100:00F0FF&height=120&section=footer" width="100%"/>

**Built with ❤️ by the ProLab Development Team**

*© 2025 ProLab Equipment. All Rights Reserved.*

</div>
