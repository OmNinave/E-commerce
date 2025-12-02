# Database Cleanup & Migration Plan

## 📋 Old Database Files Found

### Files to REMOVE (No longer needed):
1. ✅ `src/data/products.js` - Hardcoded product data (migrated to SQLite)
2. ✅ `db/unified_database.json` - Old JSON database (migrated to SQLite)
3. ✅ `db/full_database.json` - Duplicate JSON database
4. ⚠️ `db/admin_database.json` - Keep temporarily for admin user migration

### Files to KEEP:
1. ✅ `db/database.js` - NEW SQLite schema
2. ✅ `db/seed.js` - Data seeding script
3. ✅ `db/api.js` - Database API layer
4. ✅ `db/ecommerce.db` - SQLite database file

## 🔄 Migration Status

### Already Migrated:
- ✅ Products (45 products from unified_database.json)
- ✅ Product images
- ✅ Categories
- ✅ Users (997 generated + admin)
- ✅ Addresses (2,045 across India)

### Need to Update:
- [ ] Admin server routes to use SQLite API
- [ ] Frontend to fetch from SQLite API
- [ ] Remove references to old data files

## 📝 Action Items

1. **Backup old files** (just in case)
2. **Update admin_server.js** to use new database API
3. **Remove old database files**
4. **Update frontend data fetching**
5. **Test all endpoints**

## ⚠️ Breaking Changes

**Frontend Changes Needed:**
- Product fetching: Now from `/api/products` (SQLite)
- Order management: Now from `/api/orders` (SQLite)
- User data: Now from `/api/users` (SQLite)

**Admin Panel Changes:**
- All CRUD operations now use SQLite
- Real-time updates possible
- Better performance with indexes

## 🚀 Next Steps

1. Create backup of old files
2. Update admin server to use SQLite API
3. Remove old database files
4. Update frontend API calls
5. Test complete flow
