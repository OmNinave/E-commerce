/**
 * Checkout Flow API Endpoints
 * Handles payment methods, gift cards, order fees, and payment processing
 */

const express = require('express');
const { db } = require('./database');

// Helper function to calculate delivery date (3-5 business days)
function calculateDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 4); // 4 days from now
    return date.toISOString().split('T')[0];
}

// Helper function to calculate order fees
function calculateOrderFees(items, giftCardCode = null) {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Delivery charge: Free for orders above ₹50,000
    const deliveryCharge = subtotal >= 50000 ? 0 : 500;

    // Marketplace fee: 2% of subtotal
    const marketplaceFee = Math.round(subtotal * 0.02 * 100) / 100;

    // Tax: 18% GST on (subtotal + delivery + marketplace fee)
    const taxableAmount = subtotal + deliveryCharge + marketplaceFee;
    const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;

    // Gift card discount
    let giftCardAmount = 0;
    if (giftCardCode) {
        const giftCard = db.prepare('SELECT balance FROM gift_cards WHERE code = ? AND is_active = 1').get(giftCardCode);
        if (giftCard) {
            // Gift card can be used up to subtotal amount
            giftCardAmount = Math.min(giftCard.balance, subtotal);
        }
    }

    // Total
    const total = Math.round((subtotal + deliveryCharge + marketplaceFee + taxAmount - giftCardAmount) * 100) / 100;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryCharge,
        marketplaceFee,
        taxAmount,
        giftCardAmount,
        total
    };
}

module.exports = function (app, requireAuth) {

    // ==================== PAYMENT METHODS ====================

    /**
     * GET /api/payment-methods
     * Get all active payment methods
     */
    app.get('/api/payment-methods', (req, res) => {
        try {
            const methods = db.prepare(`
                SELECT id, name, type, provider, icon_url, description, display_order
                FROM payment_methods 
                WHERE is_active = 1 
                ORDER BY display_order
            `).all();

            res.json({
                success: true,
                methods
            });
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            res.status(500).json({ error: 'Failed to fetch payment methods' });
        }
    });

    // ==================== GIFT CARDS ====================

    /**
     * POST /api/gift-cards/validate
     * Validate a gift card code
     */
    app.post('/api/gift-cards/validate', requireAuth, (req, res) => {
        try {
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({ error: 'Gift card code is required' });
            }

            const giftCard = db.prepare(`
                SELECT code, balance, original_amount, expires_at
                FROM gift_cards 
                WHERE code = ? 
                AND is_active = 1 
                AND (expires_at IS NULL OR expires_at > date('now'))
            `).get(code.toUpperCase());

            if (!giftCard) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid or expired gift card'
                });
            }

            if (giftCard.balance <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Gift card balance is zero'
                });
            }

            res.json({
                success: true,
                giftCard: {
                    code: giftCard.code,
                    balance: giftCard.balance,
                    expiresAt: giftCard.expires_at
                }
            });
        } catch (error) {
            console.error('Error validating gift card:', error);
            res.status(500).json({ error: 'Failed to validate gift card' });
        }
    });

    // ==================== ORDER FEES CALCULATION ====================

    /**
     * POST /api/orders/calculate-fees
     * Calculate order fees before placing order
     */
    app.post('/api/orders/calculate-fees', requireAuth, (req, res) => {
        try {
            const { items, giftCardCode } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Items are required' });
            }

            const fees = calculateOrderFees(items, giftCardCode);

            res.json({
                success: true,
                fees
            });
        } catch (error) {
            console.error('Error calculating fees:', error);
            res.status(500).json({ error: 'Failed to calculate fees' });
        }
    });

    // ==================== ENHANCED ORDER CREATION ====================

    /**
     * POST /api/orders/create-with-payment
     * Create order with payment method and fees
     */
    app.post('/api/orders/create-with-payment', requireAuth, (req, res) => {
        try {
            console.log('📝 Creating order with payment...');
            const {
                addressId,
                paymentMethodId,
                items,
                giftCardCode,
                deliveryInstructions
            } = req.body;

            const userId = req.userId;

            // === DEBUG LOGGING ===
            console.log('=== ORDER CREATION DEBUG ===');
            console.log('User ID:', userId);
            console.log('Address ID:', addressId, 'Type:', typeof addressId);
            console.log('Payment Method ID:', paymentMethodId);
            console.log('Items count:', items?.length);
            console.log('Request body keys:', Object.keys(req.body));
            console.log('===========================');

            // Validate inputs
            if (!paymentMethodId || !items || items.length === 0) {
                console.error('❌ Missing required fields');
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Handle missing addressId - use most recent address
            let finalAddressId = addressId;
            if (!finalAddressId) {
                console.log('⚠️ No addressId provided, looking for most recent address...');
                const recentAddress = db.prepare(
                    'SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
                ).get(userId);

                if (!recentAddress) {
                    console.error('❌ No addresses found for user');
                    return res.status(400).json({
                        error: 'No address provided and no saved addresses found. Please add an address first.'
                    });
                }

                finalAddressId = recentAddress.id;
                console.log(`✅ Using most recent address: ${finalAddressId}`);
            }

            // Verify address belongs to user
            const address = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?')
                .get(finalAddressId, userId);

            if (!address) {
                console.error(`❌ Address ${finalAddressId} not found for user ${userId}`);

                // List user's addresses for debugging
                const userAddresses = db.prepare('SELECT id FROM addresses WHERE user_id = ?').all(userId);
                console.log(`User ${userId} has ${userAddresses.length} addresses:`, userAddresses.map(a => a.id));

                return res.status(404).json({
                    error: 'Address not found. Please select a valid address.',
                    availableAddresses: userAddresses.map(a => a.id)
                });
            }

            console.log(`✅ Address ${finalAddressId} verified for user ${userId}`);

            // Verify payment method exists
            const paymentMethod = db.prepare('SELECT id, type FROM payment_methods WHERE id = ?').get(paymentMethodId);
            if (!paymentMethod) {
                console.error('❌ Payment method not found');
                return res.status(404).json({ error: 'Payment method not found' });
            }

            // Calculate fees
            console.log('Calculating fees...');
            const fees = calculateOrderFees(items, giftCardCode);
            console.log('Fees calculated:', fees);

            // Determine payment status
            const paymentStatus = paymentMethod.type === 'offline' ? 'cod' : 'pending';

            // Start transaction
            console.log('Starting DB transaction...');
            const createOrder = db.transaction(() => {
                try {
                    // 1. Create order
                    console.log('Inserting order...');
                    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    const orderResult = db.prepare(`
                        INSERT INTO orders (
                            order_number, user_id, shipping_address_id, payment_method_id,
                            subtotal, total_amount, status, payment_status,
                            estimated_delivery, notes,
                            created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    `).run(
                        orderNumber,
                        userId,
                        finalAddressId,
                        paymentMethodId,
                        fees.subtotal,
                        fees.total,
                        'pending',
                        paymentStatus,
                        calculateDeliveryDate(),
                        deliveryInstructions || null
                    );

                    const orderId = orderResult.lastInsertRowid;
                    console.log(`Order inserted with ID: ${orderId}`);

                    // 2. Insert order items
                    console.log('Inserting order items...');
                    const insertItem = db.prepare(`
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?)
                    `);

                    for (const item of items) {
                        const totalPrice = item.price * item.quantity;
                        insertItem.run(orderId, item.id, item.quantity, item.price, totalPrice);

                        // Update product stock
                        db.prepare(`
                            UPDATE products 
                            SET stock_quantity = stock_quantity - ? 
                            WHERE id = ?
                        `).run(item.quantity, item.id);
                    }

                    // 3. Insert order fees
                    console.log('Inserting order fees...');
                    db.prepare(`
                        INSERT INTO order_fees (
                            order_id, delivery_charge, marketplace_fee,
                            tax_amount, gift_card_amount
                        ) VALUES (?, ?, ?, ?, ?)
                    `).run(
                        orderId,
                        fees.deliveryCharge,
                        fees.marketplaceFee,
                        fees.taxAmount,
                        fees.giftCardAmount
                    );

                    // 4. Apply gift card if used
                    if (giftCardCode && fees.giftCardAmount > 0) {
                        console.log('Updating gift card...');
                        db.prepare(`
                            UPDATE gift_cards 
                            SET balance = balance - ? 
                            WHERE code = ?
                        `).run(fees.giftCardAmount, giftCardCode.toUpperCase());
                    }

                    // 5. Create payment transaction for online payments
                    if (paymentMethod.type === 'online') {
                        console.log('Creating payment transaction...');
                        const transactionId = `TXN_${Date.now()}_${orderId}`;
                        db.prepare(`
                            INSERT INTO payment_transactions (
                                order_id, payment_method_id, transaction_id,
                                amount, status
                            ) VALUES (?, ?, ?, ?, ?)
                        `).run(orderId, paymentMethodId, transactionId, fees.total, 'pending');
                    }

                    return orderId;
                } catch (txError) {
                    console.error('Transaction error:', txError);
                    throw txError;
                }
            });

            const orderId = createOrder();
            console.log('✅ Order created successfully:', orderId);

            res.status(201).json({
                success: true,
                order_id: orderId,
                total_amount: fees.total,
                payment_status: paymentStatus,
                payment_type: paymentMethod.type
            });

        } catch (error) {
            console.error('❌ Error creating order:', error);
            res.status(500).json({
                error: 'Failed to create order',
                details: error.message,
                stack: error.stack
            });
        }
    });

    // ==================== PAYMENT CONFIRMATION ====================

    /**
     * POST /api/orders/:id/confirm-payment
     * Confirm payment for an order (after gateway success)
     */
    app.post('/api/orders/:id/confirm-payment', requireAuth, (req, res) => {
        try {
            const { id } = req.params;
            const { transactionId, gatewayResponse } = req.body;
            const userId = req.userId;

            // Verify order belongs to user
            const order = db.prepare('SELECT id, payment_status FROM orders WHERE id = ? AND user_id = ?').get(id, userId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            if (order.payment_status !== 'pending') {
                return res.status(400).json({ error: 'Order payment already processed' });
            }

            // Update in transaction
            const confirmPayment = db.transaction(() => {
                // Update payment transaction
                db.prepare(`
                    UPDATE payment_transactions 
                    SET status = 'success',
                        transaction_id = ?,
                        gateway_response = ?,
                        payment_date = datetime('now'),
                        updated_at = datetime('now')
                    WHERE order_id = ?
                `).run(transactionId, JSON.stringify(gatewayResponse || {}), id);

                // Update order
                db.prepare(`
                    UPDATE orders 
                    SET payment_status = 'paid',
                        status = 'confirmed',
                        updated_at = datetime('now')
                    WHERE id = ?
                `).run(id);
            });

            confirmPayment();

            res.json({
                success: true,
                message: 'Payment confirmed successfully'
            });

        } catch (error) {
            console.error('Error confirming payment:', error);
            res.status(500).json({ error: 'Failed to confirm payment' });
        }
    });

    /**
     * POST /api/orders/:id/payment-failed
     * Mark payment as failed and restore stock
     */
    app.post('/api/orders/:id/payment-failed', requireAuth, (req, res) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.userId;

            // Verify order belongs to user
            const order = db.prepare('SELECT id FROM orders WHERE id = ? AND user_id = ?').get(id, userId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Update in transaction
            const failPayment = db.transaction(() => {
                // Update payment transaction
                db.prepare(`
                    UPDATE payment_transactions 
                    SET status = 'failed',
                        gateway_response = ?,
                        updated_at = datetime('now')
                    WHERE order_id = ?
                `).run(JSON.stringify({ reason }), id);

                // Update order
                db.prepare(`
                    UPDATE orders 
                    SET payment_status = 'failed',
                        status = 'cancelled',
                        updated_at = datetime('now')
                    WHERE id = ?
                `).run(id);

                // Restore product stock
                const orderItems = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
                for (const item of orderItems) {
                    db.prepare(`
                        UPDATE products 
                        SET stock_quantity = stock_quantity + ? 
                        WHERE id = ?
                    `).run(item.quantity, item.product_id);
                }
            });

            failPayment();

            res.json({
                success: true,
                message: 'Payment marked as failed'
            });

        } catch (error) {
            console.error('Error marking payment as failed:', error);
            res.status(500).json({ error: 'Failed to process payment failure' });
        }
    });

    // ==================== GET ORDER WITH FEES ====================

    /**
     * GET /api/orders/:id/details
     * Get complete order details including fees
     */
    app.get('/api/orders/:id/details', requireAuth, (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.userId;

            // Get order
            const order = db.prepare(`
                SELECT o.*, 
                       pm.name as payment_method_name,
                       pm.type as payment_type,
                       a.full_name, a.phone, a.address_line1, a.address_line2,
                       a.city, a.state, a.pincode, a.landmark
                FROM orders o
                LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
                LEFT JOIN addresses a ON o.shipping_address_id = a.id
                WHERE o.id = ? AND o.user_id = ?
            `).get(id, userId);

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Get order items
            const items = db.prepare(`
                SELECT oi.*, p.name, p.model, p.slug
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `).all(id);

            // Get order fees
            const fees = db.prepare('SELECT * FROM order_fees WHERE order_id = ?').get(id);

            // Get payment transaction
            const transaction = db.prepare('SELECT * FROM payment_transactions WHERE order_id = ?').get(id);

            res.json({
                success: true,
                order: {
                    ...order,
                    items,
                    fees: fees || {},
                    transaction: transaction || null
                }
            });

        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).json({ error: 'Failed to fetch order details' });
        }
    });

};
