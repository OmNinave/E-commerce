# Render Deployment Configuration

## Build Command
```bash
npm install
```

## Start Command
```bash
node db/admin_server.js
```

## Environment Variables

Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-secure-random-32-char-string>
DATABASE_URL=<will-be-auto-filled-by-render-postgres>
RAZORPAY_MODE=test
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

## Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

1. Create PostgreSQL database in Render
2. Copy the "Internal Database URL"
3. Paste it as `DATABASE_URL` environment variable
4. Run migration after first deploy:
   ```bash
   node migrate_to_postgres.js
   ```

## Frontend Environment Variable

In Render Static Site, add:
```
REACT_APP_API_URL=<your-backend-url-from-render>
```

Example: `https://ecommerce-backend.onrender.com`

## CORS Configuration

Make sure your backend allows the frontend URL in CORS settings.

## Health Check (Optional)

To keep free tier service awake:
- Use UptimeRobot.com (free)
- Ping your backend URL every 5 minutes
- URL: `https://your-backend.onrender.com/api/products`
