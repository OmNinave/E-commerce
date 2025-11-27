import React from 'react';
import '../styles/MyOrders.css'; // Reuse styles for consistency

const Notifications = () => {
    return (
        <div className="my-orders-container">
            <h1>Notifications</h1>
            <div className="empty-state">
                <p>You have no new notifications.</p>
            </div>
        </div>
    );
};

export default Notifications;
