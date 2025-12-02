# Complete Checkout Flow Implementation Plan

## 🎯 Overview
This document outlines the complete implementation of a professional multi-step checkout flow with payment integration.

---

## 📊 Database Schema Changes

### 1. New Tables

#### `payment_methods` table
```sql
CREATE TABLE payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- 'UPI', 'Card', 'NetBanking', 'COD', 'EMI'
    type TEXT NOT NULL,                    -- 'online', 'offline'
    provider TEXT,                         -- 'PhonePe', 'GooglePay', 'Paytm', etc.
    icon_url TEXT,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `payment_transactions` table
```sql
CREATE TABLE payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    payment_method_id INTEGER NOT NULL,
    transaction_id TEXT UNIQUE,            -- Gateway transaction ID
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL,                  -- 'pending', 'success', 'failed', 'refunded'
    payment_gateway TEXT,                  -- 'razorpay', 'phonepe', 'mock'
    gateway_response TEXT,                 -- JSON response from gateway
    payment_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);
```

#### `order_fees` table
```sql
CREATE TABLE order_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    delivery_charge REAL DEFAULT 0,
    marketplace_fee REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    gift_card_amount REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### `gift_cards` table
```sql
CREATE TABLE gift_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    balance REAL NOT NULL,
    original_amount REAL NOT NULL,
    user_id INTEGER,
    is_active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### `saved_cards` table (for future use)
```sql
CREATE TABLE saved_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    card_last_four TEXT NOT NULL,
    card_brand TEXT NOT NULL,              -- 'Visa', 'Mastercard', 'Rupay'
    card_token TEXT NOT NULL,              -- Tokenized card (from gateway)
    cardholder_name TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. Modified Tables

#### Update `orders` table
```sql
ALTER TABLE orders ADD COLUMN payment_method_id INTEGER;
ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN estimated_delivery_date TEXT;
ALTER TABLE orders ADD COLUMN delivery_instructions TEXT;
```

---

## 🛣️ Routing Structure

### New Routes to Add

```javascript
// In App.jsx
<Route path="/checkout/address" element={<PrivateRoute><CheckoutAddress /></PrivateRoute>} />
<Route path="/checkout/payment" element={<PrivateRoute><CheckoutPayment /></PrivateRoute>} />
<Route path="/checkout/review" element={<PrivateRoute><CheckoutReview /></PrivateRoute>} />
<Route path="/checkout/payment-gateway" element={<PrivateRoute><PaymentGateway /></PrivateRoute>} />
<Route path="/checkout/success/:orderId" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
```

### Route Flow Logic

```
/cart 
  → Click "Proceed to Checkout"
    → /checkout/address (Select/Add Address)
      → Click "Continue to Payment"
        → /checkout/payment (Select Payment Method)
          → Click "Continue"
            → /checkout/review (Review Order)
              → If COD: Click "Place Order" → Create Order → /checkout/success/:orderId
              → If Online: Click "Pay Now" → /checkout/payment-gateway → Payment → /checkout/success/:orderId
```

---

## 🎨 Page Designs & Components

### 1. **CheckoutAddress.jsx**

**Purpose:** Select or add delivery address

**UI Elements:**
- Progress indicator (Step 1 of 3)
- List of saved addresses (radio selection)
- "Add New Address" button
- Selected address highlighted
- "Continue to Payment" button (disabled until address selected)

**State Management:**
```javascript
const [addresses, setAddresses] = useState([]);
const [selectedAddressId, setSelectedAddressId] = useState(null);
const [showAddModal, setShowAddModal] = useState(false);
```

**API Calls:**
- GET `/api/addresses` - Fetch user addresses
- POST `/api/addresses` - Add new address
- PUT `/api/addresses/:id` - Update address

**Navigation Logic:**
```javascript
const handleContinue = () => {
  // Save selected address to session/context
  sessionStorage.setItem('checkoutAddressId', selectedAddressId);
  navigate('/checkout/payment');
};
```

---

### 2. **CheckoutPayment.jsx**

**Purpose:** Select payment method

**UI Elements:**
- Progress indicator (Step 2 of 3)
- Payment method cards/sections:
  - **UPI** (PhonePe, GooglePay, Paytm, Any UPI)
  - **Cards** (Credit/Debit, Add New Card)
  - **Net Banking** (Bank dropdown)
  - **EMI** (if eligible)
  - **COD** (Cash on Delivery)
  - **Gift Card** (Enter code)
- Selected method highlighted
- "Continue to Review" button

**State Management:**
```javascript
const [paymentMethods, setPaymentMethods] = useState([]);
const [selectedMethod, setSelectedMethod] = useState(null);
const [giftCardCode, setGiftCardCode] = useState('');
const [giftCardBalance, setGiftCardBalance] = useState(0);
```

**API Calls:**
- GET `/api/payment-methods` - Fetch available methods
- POST `/api/gift-cards/validate` - Validate gift card

**Navigation Logic:**
```javascript
const handleContinue = () => {
  sessionStorage.setItem('checkoutPaymentMethod', JSON.stringify(selectedMethod));
  sessionStorage.setItem('giftCardCode', giftCardCode);
  navigate('/checkout/review');
};
```

---

### 3. **CheckoutReview.jsx**

**Purpose:** Final order review and confirmation

**UI Elements:**
- Progress indicator (Step 3 of 3)
- **Left Panel:**
  - Product list with images, qty, price
  - Delivery address (with "Change" link)
  - Payment method (with "Change" link)
  - Estimated delivery date
- **Right Panel (Order Summary):**
  ```
  Subtotal:           ₹X,XXX
  Delivery Charges:   ₹XXX
  Marketplace Fees:   ₹XXX
  Tax (GST):          ₹XXX
  Gift Card Applied: -₹XXX
  ─────────────────────────
  Order Total:        ₹X,XXX
  ```
- **Bottom:**
  - If COD: "Place Order" button
  - If Online: "Proceed to Payment" button

**State Management:**
```javascript
const [orderSummary, setOrderSummary] = useState(null);
const [address, setAddress] = useState(null);
const [paymentMethod, setPaymentMethod] = useState(null);
const [isProcessing, setIsProcessing] = useState(false);
```

**Critical Logic:**
```javascript
const handlePlaceOrder = async () => {
  setIsProcessing(true);
  
  const paymentMethod = JSON.parse(sessionStorage.getItem('checkoutPaymentMethod'));
  
  if (paymentMethod.type === 'offline') {
    // COD Flow - Create order directly
    try {
      const orderData = {
        addressId: sessionStorage.getItem('checkoutAddressId'),
        paymentMethodId: paymentMethod.id,
        items: cartItems,
        giftCardCode: sessionStorage.getItem('giftCardCode')
      };
      
      const response = await apiService.createOrder(orderData);
      
      // Clear cart and session
      clearCart();
      sessionStorage.removeItem('checkoutAddressId');
      sessionStorage.removeItem('checkoutPaymentMethod');
      
      // Navigate to success
      navigate(`/checkout/success/${response.order_id}`);
    } catch (error) {
      // Handle error
    }
  } else {
    // Online Payment Flow - Go to payment gateway
    navigate('/checkout/payment-gateway');
  }
  
  setIsProcessing(false);
};
```

---

### 4. **PaymentGateway.jsx**

**Purpose:** Handle online payment processing

**UI Elements:**
- Payment processing animation
- Gateway integration (Razorpay/PhonePe/Mock)
- Payment status messages
- Retry option on failure

**Payment Flow:**
```javascript
const initiatePayment = async () => {
  const orderData = {
    addressId: sessionStorage.getItem('checkoutAddressId'),
    paymentMethodId: paymentMethod.id,
    items: cartItems,
    giftCardCode: sessionStorage.getItem('giftCardCode'),
    paymentStatus: 'pending'
  };
  
  // Create order with pending payment
  const order = await apiService.createOrder(orderData);
  
  // Initialize payment gateway
  const paymentOptions = {
    key: process.env.REACT_APP_RAZORPAY_KEY,
    amount: order.totalAmount * 100, // in paise
    currency: 'INR',
    order_id: order.gateway_order_id,
    name: 'ProLab Equipment',
    description: `Order #${order.order_id}`,
    handler: async (response) => {
      // Payment successful
      await apiService.confirmPayment({
        orderId: order.order_id,
        transactionId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });
      
      // Navigate to success
      navigate(`/checkout/success/${order.order_id}`);
    },
    modal: {
      ondismiss: () => {
        // Payment cancelled
        setPaymentStatus('cancelled');
      }
    }
  };
  
  const razorpay = new window.Razorpay(paymentOptions);
  razorpay.open();
};
```

**For Development (Mock Payment):**
```javascript
const mockPayment = async () => {
  // Simulate payment delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Random success/failure for testing
  const isSuccess = Math.random() > 0.1; // 90% success rate
  
  if (isSuccess) {
    await apiService.confirmPayment({
      orderId: order.order_id,
      transactionId: `MOCK_${Date.now()}`,
      status: 'success'
    });
    navigate(`/checkout/success/${order.order_id}`);
  } else {
    setPaymentStatus('failed');
  }
};
```

---

### 5. **OrderSuccess.jsx**

**Purpose:** Order confirmation page

**UI Elements:**
- Success animation/icon
- Order details:
  ```
  ✅ Order Placed Successfully!
  
  Order ID: #ORD000123
  Payment Method: Cash on Delivery / UPI / Card
  Order Total: ₹X,XXX
  Estimated Delivery: Dec 5, 2025 (3-5 days)
  ```
- Product summary
- Delivery address
- Action buttons:
  - "View Order Details" (→ /orders/:id)
  - "Continue Shopping" (→ /products)
  - "Go to Home" (→ /)

**State Management:**
```javascript
const { orderId } = useParams();
const [orderDetails, setOrderDetails] = useState(null);

useEffect(() => {
  const fetchOrderDetails = async () => {
    const order = await apiService.getOrder(orderId);
    setOrderDetails(order);
  };
  fetchOrderDetails();
}, [orderId]);
```

---

## 🔌 Backend API Changes

### New Endpoints

#### 1. Payment Methods
```javascript
// GET /api/payment-methods
app.get('/api/payment-methods', (req, res) => {
  const methods = db.prepare(`
    SELECT * FROM payment_methods 
    WHERE is_active = 1 
    ORDER BY display_order
  `).all();
  
  res.json({ methods });
});
```

#### 2. Gift Card Validation
```javascript
// POST /api/gift-cards/validate
app.post('/api/gift-cards/validate', requireAuth, (req, res) => {
  const { code } = req.body;
  
  const giftCard = db.prepare(`
    SELECT * FROM gift_cards 
    WHERE code = ? AND is_active = 1 
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).get(code);
  
  if (!giftCard) {
    return res.status(404).json({ error: 'Invalid or expired gift card' });
  }
  
  res.json({ 
    balance: giftCard.balance,
    code: giftCard.code 
  });
});
```

#### 3. Calculate Order Fees
```javascript
// POST /api/orders/calculate-fees
app.post('/api/orders/calculate-fees', requireAuth, (req, res) => {
  const { items, addressId, giftCardCode } = req.body;
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate delivery charge (free above ₹50,000)
  const deliveryCharge = subtotal > 50000 ? 0 : 500;
  
  // Calculate marketplace fee (2% of subtotal)
  const marketplaceFee = subtotal * 0.02;
  
  // Calculate tax (18% GST)
  const taxAmount = (subtotal + deliveryCharge + marketplaceFee) * 0.18;
  
  // Apply gift card
  let giftCardAmount = 0;
  if (giftCardCode) {
    const giftCard = db.prepare('SELECT balance FROM gift_cards WHERE code = ?').get(giftCardCode);
    giftCardAmount = giftCard ? Math.min(giftCard.balance, subtotal) : 0;
  }
  
  // Calculate total
  const total = subtotal + deliveryCharge + marketplaceFee + taxAmount - giftCardAmount;
  
  res.json({
    subtotal,
    deliveryCharge,
    marketplaceFee,
    taxAmount,
    giftCardAmount,
    total
  });
});
```

#### 4. Modified Create Order
```javascript
// POST /api/orders
app.post('/api/orders', requireAuth, async (req, res) => {
  const { addressId, paymentMethodId, items, giftCardCode, deliveryInstructions } = req.body;
  const userId = req.user.id;
  
  try {
    // Calculate fees
    const fees = calculateOrderFees(items, giftCardCode);
    
    // Create order
    const orderResult = db.prepare(`
      INSERT INTO orders (
        user_id, address_id, payment_method_id, 
        total_amount, status, payment_status,
        estimated_delivery_date, delivery_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, addressId, paymentMethodId,
      fees.total, 'pending', 
      paymentMethodId === COD_METHOD_ID ? 'cod' : 'pending',
      calculateDeliveryDate(),
      deliveryInstructions
    );
    
    const orderId = orderResult.lastInsertRowid;
    
    // Insert order items
    for (const item of items) {
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `).run(orderId, item.productId, item.quantity, item.price);
    }
    
    // Insert order fees
    db.prepare(`
      INSERT INTO order_fees (
        order_id, delivery_charge, marketplace_fee, 
        tax_amount, gift_card_amount
      ) VALUES (?, ?, ?, ?, ?)
    `).run(orderId, fees.deliveryCharge, fees.marketplaceFee, fees.taxAmount, fees.giftCardAmount);
    
    // If gift card used, deduct balance
    if (giftCardCode && fees.giftCardAmount > 0) {
      db.prepare(`
        UPDATE gift_cards 
        SET balance = balance - ? 
        WHERE code = ?
      `).run(fees.giftCardAmount, giftCardCode);
    }
    
    // If online payment, create payment transaction
    if (paymentMethodId !== COD_METHOD_ID) {
      const transactionId = `TXN_${Date.now()}_${orderId}`;
      db.prepare(`
        INSERT INTO payment_transactions (
          order_id, payment_method_id, transaction_id, 
          amount, status
        ) VALUES (?, ?, ?, ?, ?)
      `).run(orderId, paymentMethodId, transactionId, fees.total, 'pending');
    }
    
    res.status(201).json({
      success: true,
      order_id: orderId,
      total_amount: fees.total,
      payment_status: paymentMethodId === COD_METHOD_ID ? 'cod' : 'pending'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 5. Confirm Payment
```javascript
// POST /api/orders/:id/confirm-payment
app.post('/api/orders/:id/confirm-payment', requireAuth, (req, res) => {
  const { id } = req.params;
  const { transactionId, signature } = req.body;
  
  try {
    // Verify payment signature (if using Razorpay)
    // const isValid = verifyPaymentSignature(transactionId, signature);
    
    // Update payment transaction
    db.prepare(`
      UPDATE payment_transactions 
      SET status = 'success', payment_date = datetime('now')
      WHERE order_id = ?
    `).run(id);
    
    // Update order
    db.prepare(`
      UPDATE orders 
      SET payment_status = 'paid', status = 'confirmed'
      WHERE id = ?
    `).run(id);
    
    // Send confirmation email
    sendOrderConfirmationEmail(id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔄 Integration with Existing Workflow

### Changes to Existing Files

#### 1. **Cart.jsx**
```javascript
// OLD: Direct checkout button
<Button onClick={handleCheckout}>Proceed to Checkout</Button>

// NEW: Navigate to address selection
<Button onClick={() => navigate('/checkout/address')}>
  Proceed to Checkout
</Button>

// REMOVE: Old handleCheckout function that created order directly
```

#### 2. **Checkout.jsx**
```javascript
// This file can be DEPRECATED or REPURPOSED
// Option 1: Delete it
// Option 2: Make it a wrapper that redirects to /checkout/address
```

#### 3. **Navigation.jsx**
```javascript
// No changes needed - checkout routes are protected
```

#### 4. **App.jsx**
```javascript
// ADD new routes (shown in Routing Structure section above)
// KEEP old routes for backward compatibility initially
```

---

## 🧪 Testing Checklist

### COD Flow
- [ ] Select address → Continue
- [ ] Select COD → Continue
- [ ] Review order → Place Order
- [ ] Order created with status 'pending', payment_status 'cod'
- [ ] Success page shows correct details
- [ ] Cart is cleared
- [ ] Order appears in My Orders

### Online Payment Flow
- [ ] Select address → Continue
- [ ] Select UPI/Card → Continue
- [ ] Review order → Proceed to Payment
- [ ] Payment gateway opens
- [ ] Payment success → Order created with status 'confirmed', payment_status 'paid'
- [ ] Payment failure → Can retry
- [ ] Success page shows correct details

### Edge Cases
- [ ] No addresses → Prompt to add
- [ ] Payment gateway failure → Error handling
- [ ] Network error during order creation
- [ ] Gift card validation
- [ ] Fee calculations accuracy

---

## 📝 Implementation Checklist

### Phase 1: Database (Day 1 - 1 hour)
- [ ] Create migration script for new tables
- [ ] Seed payment_methods table
- [ ] Update orders table schema
- [ ] Test database changes

### Phase 2: Backend APIs (Day 1 - 2 hours)
- [ ] Implement payment-methods endpoint
- [ ] Implement gift-card validation
- [ ] Implement calculate-fees endpoint
- [ ] Update create-order endpoint
- [ ] Implement confirm-payment endpoint
- [ ] Test all endpoints with Postman

### Phase 3: Frontend Pages (Day 2 - 3 hours)
- [ ] Create CheckoutAddress.jsx
- [ ] Create CheckoutPayment.jsx
- [ ] Create CheckoutReview.jsx
- [ ] Create PaymentGateway.jsx
- [ ] Create OrderSuccess.jsx
- [ ] Create shared components (PaymentMethodCard, OrderSummaryCard, etc.)

### Phase 4: Integration (Day 2 - 1 hour)
- [ ] Update Cart.jsx navigation
- [ ] Add routes to App.jsx
- [ ] Test complete flow (COD)
- [ ] Test complete flow (Online - Mock)
- [ ] Handle session storage cleanup

### Phase 5: Polish & Testing (Day 3 - 1 hour)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add animations
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

---

## 🎯 Success Criteria

✅ User can complete checkout with COD without payment gateway  
✅ User can complete checkout with online payment (mock)  
✅ Order fees calculated correctly  
✅ Gift cards work properly  
✅ All data saved to database correctly  
✅ Email confirmations sent  
✅ No breaking changes to existing functionality  
✅ Mobile responsive  
✅ Professional UI/UX  

---

## 🚀 Ready to Implement?

This plan ensures:
1. ✅ Proper payment logic (COD vs Online)
2. ✅ Complete database structure
3. ✅ All routes and navigation
4. ✅ Backward compatibility
5. ✅ Professional implementation

**Estimated Total Time: 6-8 hours across 2-3 days**

Would you like me to start implementing this step by step?
