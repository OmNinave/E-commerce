# Database for E-commerce Project

This directory contains the database files for the e-commerce project with user data and product purchase history.

## Database Structure

The database is stored in `full_database.json` and contains three main collections:

### 1. Users
- **20 users** with the following information:
  - `id`: Unique user identifier
  - `name`: User's name
  - `email`: User's email address
  - `registrationDate`: User's registration date (within the last 2 months)

### 2. Products
- **45 products** with information and quantities based on sales data:
  - `productId`: Unique product identifier
  - `productName`: Name of the product
  - `currentQuantity`: Current available quantity (adjusted based on sales)
  - `totalSold`: Total quantity sold in the past 2 months

### 3. Purchase History
- Purchase records for the past 2 months:
  - `userId`: ID of the user who made the purchase
  - `productId`: ID of the purchased product
  - `productName`: Name of the purchased product
  - `purchaseDate`: Date of purchase (within the last 2 months)
  - `quantity`: Quantity purchased
  - `price`: Price of the product (randomly generated for demonstration)

## How to Regenerate the Database

To regenerate the database with new random data:

1. Run the full database generation script:
   ```
   node generate_full_database.js
   ```

This will create a new `full_database.json` file with:
- 20 users with random registration dates within the last 2 months
- 45 products with quantities adjusted based on simulated sales data
- Purchase history for the past 2 months with random dates and quantities

## Data Generation Details

- **User Registration Dates**: Random dates within the last 2 months
- **Purchase Dates**: Random dates within the last 2 months
- **Product Quantities**: Base quantity of 50 per product, adjusted based on sales
- **Purchase Quantities**: Random quantities between 1-5 per purchase
- **Number of Purchases**: Each user makes between 1-10 purchases
- **Product Prices**: Random prices between 1000-100000 for demonstration

## Files in this Directory

- `full_database.json`: The main database file with all data
- `all_products.json`: Extracted product information from the source data
- `generate_full_database.js`: Script to regenerate the database
- `README.md`: This documentation file

## Usage in Your Application

To use this database in your e-commerce application, you can:
1. Load the `full_database.json` file
2. Parse the JSON data
3. Use the data to populate your application's UI and functionality

The database provides realistic data for testing and development purposes, with product quantities that reflect sales trends over the past 2 months.