# Quick Testing Guide - Search & Pagination

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd "A:\Coding Space\workspace\Internship\project\ecomerce\db"
node admin_server.js
```
Expected output:
```
Using port: 5000
Server running on port 5000
```

### 2. Start the Frontend
```bash
cd "A:\Coding Space\workspace\Internship\project\ecomerce"
npm start
```

### 3. Navigate to Products Page
Open browser: `http://localhost:3000/products` or `http://localhost:5173/products`

## ✅ Quick Test Scenarios

### Test 1: Basic Search
1. Type "microscope" in search box
2. ✅ Should show only microscope products
3. ✅ Should reset to page 1
4. ✅ Should show autocomplete suggestions

### Test 2: Category Filter
1. Click on a category (e.g., "Laboratory Equipment")
2. ✅ Should show only products in that category
3. ✅ Should reset to page 1
4. ✅ Pagination should update

### Test 3: Sorting
1. Select "Price: Low to High"
2. ✅ Products should be sorted by price ascending
3. ✅ Should maintain current filters
4. ✅ Should reset to page 1

### Test 4: Pagination
1. Click "Next" or page number "2"
2. ✅ Should load next 12 products
3. ✅ Should scroll to top
4. ✅ Should maintain filters and sort

### Test 5: Combined Filters
1. Search for "lab"
2. Select category "Safety Equipment"
3. Sort by "Name: A to Z"
4. Navigate to page 2
5. ✅ All filters should work together

### Test 6: Clear Filters
1. Apply some filters
2. Click "Clear All Filters"
3. ✅ Should reset all filters
4. ✅ Should show all products
5. ✅ Should reset to page 1

## 🔍 What to Look For

### In Browser Console
```
🔄 Fetching products from API with filters: { page: 1, search: "...", category: "...", sort: "..." }
📦 API Response: { success: true, products: [...], pagination: {...} }
✅ Loaded 12 products from API
```

### In Network Tab
- Request URL: `http://localhost:5000/api/products?page=1&limit=12&search=...&category=...&sort=...`
- Status: 200 OK
- Response: JSON with products and pagination

### On Page
- Products grid shows 12 items (or fewer on last page)
- Pagination shows correct page numbers
- Active filters are highlighted
- Loading spinner appears during fetch
- No console errors

## 🐛 Troubleshooting

### Backend Not Running
**Symptom**: Yellow warning "Backend server not available"
**Solution**: Start backend with `node db/admin_server.js`

### No Products Showing
**Symptom**: "No products found"
**Check**:
1. Backend is running
2. Database has products
3. Filters are not too restrictive
4. Check browser console for errors

### Filters Not Working
**Symptom**: Products don't change when filtering
**Check**:
1. Network tab shows API request
2. API request includes filter parameters
3. Backend console shows no errors
4. Database query is correct

### Pagination Issues
**Symptom**: Can't navigate pages
**Check**:
1. totalPages is correct in response
2. currentPage state is updating
3. API is called with correct page number

## 📊 Expected API Responses

### Successful Response
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "selling_price": 999.99,
      "category_name": "Category",
      "primary_image": "image_url",
      ...
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 58,
    "limit": 12
  }
}
```

### Error Response
```json
{
  "error": "Failed to fetch products"
}
```

## 🎯 Test Coverage

### Must Test
- [x] Search functionality
- [x] Category filtering
- [x] All 6 sort options
- [x] Pagination navigation
- [x] Combined filters
- [x] Clear filters

### Should Test
- [ ] Empty search results
- [ ] Special characters in search
- [ ] Rapid filter changes
- [ ] Browser back button
- [ ] Page refresh with filters

### Nice to Test
- [ ] Very long search terms
- [ ] Network throttling
- [ ] Backend offline scenario
- [ ] Mobile responsiveness

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Search works correctly
[ ] Category filter works
[ ] All sort options work
[ ] Pagination works
[ ] Combined filters work
[ ] Clear filters works
[ ] No console errors
[ ] Performance is good

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

## 🚦 Status Indicators

### ✅ Working Correctly
- Green checkmark in UI
- No console errors
- Expected results shown
- Fast response times

### ⚠️ Warning
- Yellow banner shown
- Fallback to static products
- Backend may be offline

### ❌ Error
- Red error message
- Console errors present
- No products shown
- Network request failed

---

**Quick Reference**: If everything is working, you should be able to search, filter, sort, and paginate through products smoothly with no errors in the console.
