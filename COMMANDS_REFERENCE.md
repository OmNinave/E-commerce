# 🎯 Quick Commands Reference

Copy and paste these commands as needed.

---

## 📤 Git Commands (Upload to GitHub)

### First Time Setup
```powershell
# Navigate to project
cd "A:\Coding Space\workspace\Internship\project\ecomerce"

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit files
git commit -m "Ready for deployment"

# Connect to GitHub (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Regular Updates (After Making Changes)
```powershell
# Navigate to project
cd "A:\Coding Space\workspace\Internship\project\ecomerce"

# Check what changed
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

---

## 🧪 Local Testing Commands

### Install Dependencies (First Time Only)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm install
```

### Start Frontend (Development)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm start
```
**Opens:** http://localhost:3000

### Start Backend (Development)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce\db"
node admin_server.js
```
**Runs on:** http://localhost:5000

### Build for Production (Test)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm run build
```
**Creates:** `build/` folder with production files

### Test Production Build Locally
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npx serve -s build
```
**Opens:** http://localhost:3000 (or different port)

---

## 🚀 Netlify CLI Commands (Optional)

### Install Netlify CLI
```powershell
npm install -g netlify-cli
```

### Login to Netlify
```powershell
netlify login
```
**Opens browser** - Click "Authorize"

### Initialize Netlify in Project
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
netlify init
```
**Follow prompts** - Select your site

### Deploy to Production
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
netlify deploy --prod
```

### Deploy Preview (Testing)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
netlify deploy
```

---

## 🔧 Database Commands

### Generate Unified Database
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce\db"
node generate_unified_db.js
```
**Creates:** `unified_database.json` file

---

## 📋 Environment Variables Setup

### Render (Backend) - Set in Dashboard
**No commands needed** - Set in Render Dashboard → Environment tab

**Variables to add:**
```
NODE_ENV = production
PORT = 5000
FRONTEND_URL = https://your-site.netlify.app
```

### Netlify (Frontend) - Set in Dashboard
**No commands needed** - Set in Netlify Dashboard → Environment variables

**Variable to add:**
```
REACT_APP_API_URL = https://your-backend.onrender.com
```

---

## 🧹 Cleanup Commands

### Remove node_modules (If Needed)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
Remove-Item -Recurse -Force node_modules
```

### Reinstall Dependencies
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm install
```

### Clear Build Folder
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
Remove-Item -Recurse -Force build
```

### Rebuild
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm run build
```

---

## 🔍 Verification Commands

### Check Git Status
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
git status
```

### Check Git Remote (GitHub Connection)
```powershell
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
git remote -v
```

### Check Node Version
```powershell
node --version
```
**Should be:** v18.x or higher

### Check npm Version
```powershell
npm --version
```
**Should be:** 8.0.0 or higher

### Check if Port is in Use
```powershell
# Check port 3000 (frontend)
netstat -ano | findstr :3000

# Check port 5000 (backend)
netstat -ano | findstr :5000
```

---

## 📝 Quick Copy-Paste Workflow

### Complete Deployment Workflow
```powershell
# 1. Navigate to project
cd "A:\Coding Space\workspace\Internship\project\ecomerce"

# 2. Check status
git status

# 3. Add all files
git add .

# 4. Commit
git commit -m "Deployment ready"

# 5. Push to GitHub
git push origin main

# 6. Build test (optional)
npm run build
```

### After Making Changes
```powershell
# Quick update workflow
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
git add .
git commit -m "Updated features"
git push origin main
```

---

## 🌐 Testing URLs

### Local Testing
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API Test: http://localhost:5000/api/products
Admin:    http://localhost:3000/admin
```

### Production Testing
```
Frontend: https://your-site.netlify.app
Backend:  https://your-backend.onrender.com
API Test: https://your-backend.onrender.com/api/products
Admin:    https://your-site.netlify.app/admin
```

---

## ⚠️ Common Issues & Fixes

### "Command not found" Errors
```powershell
# If git not found, install Git for Windows
# Download from: https://git-scm.com/download/win

# If node not found, install Node.js
# Download from: https://nodejs.org/
```

### Port Already in Use
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Permission Denied
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → "Run as Administrator"
```

---

## 📚 More Help

- **Detailed Guide:** `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Visual Guide:** `VISUAL_DEPLOYMENT_GUIDE.md`
- **Quick Deploy:** `QUICK_DEPLOY.md`
- **Checklist:** `NETLIFY_DEPLOYMENT_CHECKLIST.md`

---

**Tip:** Bookmark this file for quick reference! 🚀

