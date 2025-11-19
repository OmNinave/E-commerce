## JSON to PostgreSQL Schema Mapping

### Overview
This document maps fields from the JSON file-based database (`unified_database.json` and `admin_database.json`) to the PostgreSQL normalized schema (13 tables).

---

## Users

### JSON Structure
```json
{
  "users": [
    {
      "id": "user001",
      "email": "john@example.com",
      "password": "sha256_hash_or_bcrypt_hash",
      "fullName": "John Doe",
      "registrationDate": "2024-01-15",
      "accountCreatedDate": "2024-01-15",
      "lastLoginDate": "2024-11-16",
      "isNewUser": true,
      "totalSpent": 1250.50,
      "totalOrders": 5,
      "purchaseHistory": [...]
    }
  ]
}
```

### PostgreSQL Mapping
| JSON Field | SQL Table | SQL Column | Type | Notes |
|---|---|---|---|---|
| `id` | users | `user_id` | VARCHAR(20) | Unique identifier from JSON |
| `email` | users | `email` | VARCHAR(255) | Email address (unique) |
| `password` | users | `password_hash` | VARCHAR(255) | bcrypt or SHA256 hash |
| `fullName` | users | `full_name` | VARCHAR(255) | User's full name |
| `registrationDate` | users | `registration_date` | DATE | Date of registration |
| `accountCreatedDate` | users | `account_created_date` | DATE | Account creation date |
| `lastLoginDate` | users | `last_login_date` | DATE | Last login timestamp |
| `isNewUser` | users | `is_new_user` | BOOLEAN | New user flag |
| `totalSpent` | users | `total_spent` | NUMERIC(12,2) | Total amount spent |
| `totalOrders` | users | `total_orders` | INTEGER | Count of orders |
| `purchaseHistory` | purchase_history | (related via user_id) | — | See Purchase History section |

---

## Products

### JSON Structure
```json
{
  "products": [
    {
      "id": "PROD001",
      "name": "Industrial Pump",
      "model": "IP-5000",
      "category": "Pumps",
      "price": 5000.00,
      "currentPrice": 4500.00,
      "originalPrice": 5500.00,
      "currentQuantity": 15,
      "totalSold": 48,
      "image": "url_to_image",
      "overview": "High-performance industrial pump...",
      "features": ["Feature 1", "Feature 2"],
      "specifications": {"Power": "5kW", "Flow": "100 L/min"},
      "applications": ["Mining", "Oil & Gas"],
      "operation": "AC powered, 3-phase",
      "advantages": ["Reliable", "Efficient"],
      "considerations": ["Requires maintenance"],
      "compliance": "ISO 9001",
      "commitment": "2-year warranty",
      "salesHistory": [...],
      "restockHistory": [...],
      "inProcessOrders": [...]
    }
  ]
}
```

### PostgreSQL Mapping
| JSON Field | SQL Table | SQL Column | Type | Notes |
|---|---|---|---|---|
| `id` | products | `product_id` | VARCHAR(50) | Unique product ID |
| `name` | products | `name` | VARCHAR(255) | Product name |
| `model` | products | `model` | VARCHAR(100) | Model number |
| `category` | products | `category` | VARCHAR(100) | Product category |
| `price` | products | `price` | NUMERIC(10,2) | Base price |
| `currentPrice` | products | `current_price` | NUMERIC(10,2) | Current selling price |
| `originalPrice` | products | `original_price` | NUMERIC(10,2) | Original/list price |
| `currentQuantity` | products | `current_quantity` | INTEGER | Stock available |
| `totalSold` | products | `total_sold` | INTEGER | Total units sold |
| `image` | products | `image_url` | TEXT | Image URL |
| `overview` | products | `overview` | TEXT | Product overview/description |
| `features` | products | `features` | TEXT | JSON array of features |
| `specifications` | products | `specifications` | TEXT | JSON object of specs |
| `applications` | products | `applications` | TEXT | JSON array of uses |
| `operation` | products | `operation` | TEXT | Operating instructions |
| `advantages` | products | `advantages` | TEXT | JSON array of benefits |
| `considerations` | products | `considerations` | TEXT | JSON array of notes |
| `compliance` | products | `compliance` | VARCHAR(255) | Compliance standard |
| `commitment` | products | `commitment` | TEXT | Warranty/guarantee info |
| `salesHistory` | — | — | — | Replaced by purchase_history table |
| `restockHistory` | — | — | — | Can add `product_restock_history` table if needed |
| `inProcessOrders` | — | — | — | Derived from orders where status='pending' or 'processing' |

---

## Orders

### JSON Structure
```json
{
  "orders": [
    {
      "orderId": "ORD000001",
      "userId": "user001",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "orderDate": "2024-11-10",
      "status": "pending",
      "totalAmount": 4500.00,
      "shippingInfo": {
        "address": "123 Main St",
        "trackingNumber": "TRK123456"
      },
      "items": [
        {
          "productId": "PROD001",
          "productName": "Industrial Pump",
          "quantity": 1,
          "price": 4500.00,
          "subtotal": 4500.00
        }
      ]
    }
  ]
}
```

### PostgreSQL Mapping
| JSON Field | SQL Table | SQL Column | Type | Notes |
|---|---|---|---|---|
| `orderId` | orders | `order_id` | VARCHAR(20) | Unique order ID |
| `userId` | orders | `user_id_str` | VARCHAR(20) | Original JSON user ID |
| `userId` (FK) | orders | `user_id` | INTEGER | Foreign key to users table |
| `userName` | orders | `user_name` | VARCHAR(255) | User name at order time |
| `userEmail` | orders | `user_email` | VARCHAR(255) | User email at order time |
| `orderDate` | orders | `order_date` | DATE | Order placement date |
| `status` | orders | `status` | VARCHAR(20) | pending, processing, shipped, completed |
| `totalAmount` | orders | `total_amount` | NUMERIC(12,2) | Total order amount |
| `shippingInfo` | orders | `shipping_info` | TEXT | JSON object with shipping details |
| `items[]` | order_items | (separate table) | — | See Order Items section |

---

## Order Items

### JSON Structure
Items are nested within orders; in PostgreSQL they are stored in a separate `order_items` table.

### PostgreSQL Mapping
| JSON Field | SQL Table | SQL Column | Type | Notes |
|---|---|---|---|---|
| (implicit) | order_items | `order_id` (FK) | INTEGER | Foreign key to orders |
| `productId` | order_items | `product_id_str` | VARCHAR(50) | Original product ID |
| `productId` (FK) | order_items | `product_id` | INTEGER | Foreign key to products |
| `productName` | order_items | `product_name` | VARCHAR(255) | Product name at order time |
| `quantity` | order_items | `quantity` | INTEGER | Quantity ordered |
| `price` | order_items | `price` | NUMERIC(10,2) | Unit price at order time |
| `subtotal` | order_items | `subtotal` | NUMERIC(12,2) | Quantity × Price |

---

## Purchase History

### JSON Structure
```json
{
  "purchaseHistory": [
    {
      "orderId": "ORD000001",
      "userId": "user001",
      "productId": "PROD001",
      "productName": "Industrial Pump",
      "purchaseDate": "2024-11-10",
      "quantity": 1,
      "price": 4500.00
    }
  ]
}
```

### PostgreSQL Mapping
| JSON Field | SQL Table | SQL Column | Type | Notes |
|---|---|---|---|---|
| `orderId` | purchase_history | `order_id_str` | VARCHAR(20) | Original order ID |
| `orderId` (FK) | purchase_history | `order_id` | INTEGER | Foreign key to orders (optional) |
| `userId` | purchase_history | `user_id_str` | VARCHAR(20) | Original user ID |
| `userId` (FK) | purchase_history | `user_id` | INTEGER | Foreign key to users |
| `productId` | purchase_history | `product_id_str` | VARCHAR(50) | Original product ID |
| `productId` (FK) | purchase_history | `product_id` | INTEGER | Foreign key to products |
| `productName` | purchase_history | `product_name` | VARCHAR(255) | Product name |
| `purchaseDate` | purchase_history | `purchase_date` | DATE | Date of purchase |
| `quantity` | purchase_history | `quantity` | INTEGER | Quantity purchased |
| `price` | purchase_history | `price` | NUMERIC(10,2) | Price per unit |

---

## Admin Users

### JSON Structure
```json
{
  "admin_users": [
    {
      "admin_id": "admin001",
      "email": "admin@example.com",
      "password": "bcrypt_hash_or_sha256",
      "full_name": "Admin User",
      "is_super_admin": true
    }
  ]
}
```

### PostgreSQL Mapping
| JSON Field | SQL Table | SQL Column | Type | Notes |
|---|---|---|---|---|
| `admin_id` | admin_users | `admin_id` | VARCHAR(20) | Unique admin ID |
| `email` | admin_users | `email` | VARCHAR(255) | Admin email (unique) |
| `password` | admin_users | `password_hash` | VARCHAR(255) | bcrypt hash |
| `full_name` | admin_users | `full_name` | VARCHAR(255) | Admin's full name |
| `is_super_admin` | admin_users | `is_super_admin` | BOOLEAN | Super admin flag |

---

## Future Enhancement Tables (Not in JSON)

### Wishlists Table
```sql
{
  "id": SERIAL PRIMARY KEY,
  "user_id": INTEGER (FK → users.id),
  "product_id": INTEGER (FK → products.id),
  "added_at": TIMESTAMP
}
```
- No JSON equivalent currently; stores user's wishlist items for future feature

### User Addresses Table
```sql
{
  "id": SERIAL PRIMARY KEY,
  "user_id": INTEGER (FK → users.id),
  "type": VARCHAR (billing, shipping, default),
  "street_address": VARCHAR,
  "city": VARCHAR,
  "state_province": VARCHAR,
  "postal_code": VARCHAR,
  "country": VARCHAR,
  "is_default": BOOLEAN,
  "created_at": TIMESTAMP,
  "updated_at": TIMESTAMP
}
```
- Addresses can be embedded in user profile or stored separately in future

### Audit Logs Table
```sql
{
  "id": SERIAL PRIMARY KEY,
  "admin_id": INTEGER (FK → admin_users.id),
  "action": VARCHAR (create, update, delete, approve_order, ship_order, etc.),
  "entity_type": VARCHAR (user, product, order, etc.),
  "entity_id": VARCHAR,
  "old_value": TEXT (JSON),
  "new_value": TEXT (JSON),
  "ip_address": VARCHAR,
  "user_agent": TEXT,
  "created_at": TIMESTAMP
}
```
- Not in current JSON; for admin activity tracking

---

## Migration Strategy

### Phase 1: Prepare
1. Backup JSON files (`unified_database.json`, `admin_database.json`)
2. Create PostgreSQL database: `CREATE DATABASE ecommerce_db;`
3. Run schema migrations:
   - `psql -U postgres -d ecommerce_db -f migrations/001_initial_schema.sql`
   - `psql -U postgres -d ecommerce_db -f migrations/002_indexes.sql`

### Phase 2: Migrate Data
1. Configure database connection URL in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"
   ```
2. Run migration script:
   ```
   node scripts/json_to_sql_migration.js
   ```
3. Review migration report: `logs/migration_report_*.json`

### Phase 3: Verify
1. Check row counts in each table:
   ```sql
   SELECT 'users' as table_name, COUNT(*) FROM users
   UNION ALL
   SELECT 'products', COUNT(*) FROM products
   UNION ALL
   SELECT 'orders', COUNT(*) FROM orders
   ...
   ```
2. Spot-check a few records in each table
3. Run analytics queries to ensure data integrity

### Phase 4: Update Application Code
1. Switch backend from file I/O to PostgreSQL queries
2. Update auth middleware (passwords already using bcrypt)
3. Update order creation to use transactions
4. Implement new endpoints for new features (addresses, wishlist, etc.)

---

## ID Strategy

### Current JSON IDs
- Users: `user001`, `user002`, etc. (generated as `user` + zero-padded counter)
- Products: `PROD001`, `PROD002`, etc.
- Orders: `ORD000001`, `ORD000002`, etc.
- Admin: `admin001`, `admin002`, etc.

### PostgreSQL IDs
- **SQL Primary Keys:** Auto-incrementing INTEGER (1, 2, 3, ...)
- **Business IDs:** Kept in `_str` columns (e.g., `user_id_str`, `product_id_str`) for reference and backward compatibility

### Benefits of This Approach
- Efficient foreign key relationships using integers
- Smaller index sizes
- Easier to change business ID format in future
- Maintains historical business ID references for auditing

---

## Data Type Considerations

### Numeric Fields
- **Currency fields:** NUMERIC(12, 2) for precise decimal storage (cents)
- **Quantities:** INTEGER (no decimals)
- **Decimal prices:** NUMERIC(10, 2) per unit

### JSON Storage
- **Simple JSON objects/arrays:** Stored as TEXT
- **Production optimization:** Use PostgreSQL JSONB type for nested queries
  ```sql
  ALTER TABLE products ALTER COLUMN features TYPE JSONB USING features::JSONB;
  ```

### Date/Time Fields
- **Dates only:** DATE type (YYYY-MM-DD)
- **Timestamps:** TIMESTAMP for precise timing (created_at, updated_at)
- **Indexing:** Date and timestamp columns are indexed for query optimization

---

## Query Examples

### Get user with all orders
```sql
SELECT u.*, o.order_id, o.order_date, o.total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.user_id = 'user001'
ORDER BY o.order_date DESC;
```

### Get order with all items
```sql
SELECT o.*, oi.product_name, oi.quantity, oi.price, oi.subtotal
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_id = 'ORD000001';
```

### Product sales in last 30 days
```sql
SELECT p.name, SUM(ph.quantity) as total_sold, SUM(ph.price * ph.quantity) as revenue
FROM purchase_history ph
JOIN products p ON ph.product_id = p.id
WHERE ph.purchase_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY revenue DESC;
```

---

## Notes

1. **Password Migration:** All existing password hashes (SHA256 or bcrypt) are migrated as-is. On first login after migration, the application's bcrypt fallback logic will re-hash weak passwords automatically.

2. **Referential Integrity:** Foreign keys are set to CASCADE DELETE for user and product deletions. Orders are preserved even if user is deleted (soft delete recommended in production).

3. **Indexing Strategy:** Indexes are created on:
   - Foreign keys (for JOIN performance)
   - Commonly filtered columns (email, status, category)
   - Date columns for range queries
   - Business ID columns for lookup

4. **Future Enhancements:**
   - Implement soft deletes (add `deleted_at` column)
   - Add `updated_at` TIMESTAMP fields for audit trails
   - Implement row-level security for multi-tenant scenarios
   - Archive old orders to a separate table for performance

