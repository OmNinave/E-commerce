# 🧪 COMPLETE E2E TEST GUIDE - Manual Steps

## 🎯 **Complete Workflow Test**

Follow these steps exactly to test the entire system:

---

## **STEP 1: Create New Account** ✅

1. Open http://localhost:3000
2. Click **"Sign Up"** or **"Register"**
3. Fill in:
   - **Email:** `e2etest@test.com`
   - **Password:** `Test123!`
   - **Name:** E2E Test User
4. Click **"Register"**
5. ✅ **Verify:** Successfully registered and logged in

---

## **STEP 2: Add Shipping Address** ✅

1. Click **Profile** icon → **"Addresses"**
2. Click **"Add New Address"**
3. Fill in:
   - **Name:** E2E Test User
   - **Phone:** 9876543210
   - **Address:** 123 Test Street
   - **City:** Mumbai
   - **State:** Maharashtra
   - **Pincode:** 400001
4. Click **"Save"**
5. ✅ **Verify:** Address saved successfully

---

## **STEP 3: Place Order** ✅

1. Go to **Home** page
2. Browse products
3. Click on any product
4. Click **"Add to Cart"**
5. Click **Cart** icon
6. Click **"Proceed to Checkout"**
7. Select the address you just added
8. Select **"Cash on Delivery"**
9. Click **"Place Order"**
10. ✅ **Note the Order ID** (e.g., #53, #54, etc.)
11. ✅ **Verify:** Order confirmation shown

---

## **STEP 4: Admin - View Order** ✅

1. Open new tab: http://localhost:3000/admin
2. Login as admin:
   - **Email:** `admin@ecommerce.com`
   - **Password:** `admin123`
3. Click **"Orders"** tab
4. Find the order you just placed (look for e2etest@test.com)

### **🔍 CHECK: Can Admin See Order Details?**

**Current View Shows:**
- ✅ Order ID
- ✅ User email (e2etest@test.com)
- ✅ Date
- ✅ Number of items (e.g., "1 items")
- ✅ Total amount
- ✅ Status

**❌ ISSUE: Admin CANNOT see WHAT items were ordered!**

**To see item details, admin needs to:**
- Click on the order row (if expandable)
- OR there should be a "View Details" button

**Current Status:** ⚠️ **ExpandableOrderRow component exists but NOT integrated**

---

## **STEP 5: Admin - Mark as Delivered** ✅

1. In the Orders table, find your order
2. In the **"Actions"** column, find the status dropdown
3. Change status from **"pending"** to **"delivered"**
4. ✅ **Verify:** Status updated to "DELIVERED"

---

## **STEP 6: User - Check Order Status** ✅

1. Go back to user tab (e2etest@test.com)
2. Click **Profile** → **"My Orders"**
3. **Refresh** the page (F5)
4. Find your order
5. ✅ **Verify:** Status shows "DELIVERED"
6. ✅ **Verify:** "Request Return" and "Request Replacement" buttons appear

---

## **STEP 7: User - Request Return** ⚠️

1. Click **"Request Return"** button
2. Modal should open
3. Enter reason: **"E2E test return"**
4. Click **"Submit Request"**

### **🔍 CHECK: Does it work?**

**Possible Outcomes:**

**A) ✅ Success:**
- Alert: "Return requested successfully"
- Order status changes to "return_requested"

**B) ❌ Error: "Unauthorized"**
- Check backend console for debug logs
- Look for user ID mismatch

**C) ❌ Error: "Address not found"**
- Different issue (order placement)

---

## **STEP 8: Admin - Check Return Request** ✅

1. Go to admin panel
2. Click **"Returns"** tab
3. ✅ **Verify:** Your return request appears
4. ✅ **Verify:** Shows:
   - Order ID
   - User email (e2etest@test.com)
   - Reason: "E2E test return"
   - Status: "return_requested"

---

## **STEP 9: Admin - Approve Return** ✅

1. In Returns tab, find your request
2. Click **"Approve"** button
3. ✅ **Verify:** Status changes to "returned"

---

## 📊 **Expected Results Summary:**

| Step | Feature | Status |
|------|---------|--------|
| 1 | Account Creation | ✅ Working |
| 2 | Add Address | ✅ Working |
| 3 | Place Order | ✅ Working |
| 4 | Admin View Order | ⚠️ Can't see items |
| 5 | Admin Mark Delivered | ✅ Working |
| 6 | User See Status | ✅ Working |
| 7 | User Request Return | ⚠️ May fail (testing) |
| 8 | Admin See Return | ✅ Should work |
| 9 | Admin Approve | ✅ Should work |

---

## 🔧 **Known Issues to Fix:**

### **Issue 1: Admin Can't See Order Items** ⚠️

**Problem:** Admin sees "1 items" but not WHAT items

**Solution:** Integrate `ExpandableOrderRow` component
- File: `src/admin/components/OrderComponents.jsx` (already exists)
- Needs to be used in `AdminDashboard.jsx`

### **Issue 2: Return Request May Fail** ⚠️

**Problem:** "Unauthorized" error

**Debug:** Check backend console for:
```
=== AUTH MIDDLEWARE DEBUG ===
User ID from token: ???
=== RETURN REQUEST DEBUG ===
Order user_id: ???
```

---

## 🎯 **Action Plan:**

1. **Test Steps 1-6** (should all work)
2. **Note the exact error** at Step 7 (return request)
3. **Check backend console** for debug logs
4. **Share the logs** so I can fix the exact issue
5. **Fix Issue 1** (admin can't see items) after return works

---

**Please follow these steps and share:**
1. Which step fails (if any)
2. Exact error message
3. Backend console output (if Step 7 fails)

**Let's get this working step by step!** 🚀
