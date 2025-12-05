const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
        const dateStr = String(dateInput);
        // If it looks like SQL datetime "YYYY-MM-DD HH:MM:SS", fix it
        const fixedDateStr = dateStr.includes(' ') && dateStr.includes(':') ? dateStr.replace(' ', 'T') : dateStr;
        const date = new Date(fixedDateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString();
    } catch (e) {
        return String(dateInput);
    }
};

/**
 * Expandable Order Row Component
 * Shows order items, quantities, prices, and shipping address when clicked
 */
export function ExpandableOrderRow({ order, isExpanded, onToggle, onStatusChange }) {
    const handleRowClick = () => {
        onToggle(order.orderId);
    };

    const handleStatusChange = (e) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        console.log(`📝 Status dropdown changed for order ${order.orderId}: ${order.status} → ${newStatus}`);
        onStatusChange(order.orderId, newStatus);
    };

    return (
        <>
            <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
                <td>
                    <span style={{ marginRight: '8px' }}>
                        {isExpanded ? '▼' : '▶'}
                    </span>
                    {order.orderId}
                </td>
                <td>{order.userName || order.userEmail || 'Unknown'}</td>
                <td>{formatDate(order.date || order.created_at)}</td>
                <td>{order.items?.length || 0} items</td>
                <td className="price-cell">₹{order.totalAmount?.toLocaleString() || 0}</td>
                <td>
                    <span className={`status-badge ${order.status || 'completed'}`}>
                        {order.status || 'completed'}
                    </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    <select
                        value={order.status || 'pending'}
                        onChange={handleStatusChange}
                        className="status-select"
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="returned">Returned</option>
                        <option value="replaced">Replaced</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </td>
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan="7" style={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <strong style={{ fontSize: '16px', color: '#333' }}>📦 Order Items:</strong>
                        </div>
                        <table style={{ width: '100%', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead style={{ backgroundColor: '#e9ecef' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '600', color: '#333' }}>
                                                    {item.productName || item.name || 'Product'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                                    SKU: {item.productSku || item.sku || 'N/A'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                                                {item.quantity}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                ₹{(item.unitPrice || item.price || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#28a745' }}>
                                                ₹{((item.unitPrice || item.price || 0) * (item.quantity || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                            No items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {order.shippingAddress && (
                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                                <strong style={{ color: '#333' }}>📍 Shipping Address:</strong>
                                <div style={{ marginTop: '8px', color: '#6c757d', lineHeight: '1.6' }}>
                                    <strong>{order.shippingAddress.fullName || order.shippingAddress.full_name}</strong><br />
                                    {order.shippingAddress.addressLine1 || order.shippingAddress.address_line1}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                                    Phone: {order.shippingAddress.phone}
                                </div>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

/**
 * Returns Tab Component
 * Shows all return/replacement requests with approve/reject buttons
 */
export function ReturnsView({ returnRequests, onApprove, onReject }) {
    return (
        <div className="returns-view">
            <div className="view-header">
                <h2>↩️ Return & Replacement Requests</h2>
                <p className="stats-summary">Pending Requests: {returnRequests.length}</p>
            </div>
            <div className="returns-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Request Type</th>
                            <th>Amount</th>
                            <th>Items</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returnRequests.length > 0 ? (
                            returnRequests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req.order_number}</td>
                                    <td>{req.first_name} {req.last_name}</td>
                                    <td>
                                        <span className={`status-badge ${req.status}`}>
                                            {req.status === 'return_requested' ? '↩️ Return' : '🔄 Replace'}
                                        </span>
                                    </td>
                                    <td className="price-cell">₹{req.refund_amount?.toLocaleString() || 0}</td>
                                    <td>{req.order?.items?.length || 0} items</td>
                                    <td>{formatDate(req.order?.date || req.order?.created_at)}</td>
                                    <td>
                                        <button
                                            className="action-btn approve"
                                            onClick={() => onApprove(req)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="action-btn reject"
                                            onClick={() => onReject(req)}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                    No return/replacement requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
