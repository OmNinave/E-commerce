import React from 'react';
import '../styles/MyOrders.css'; // Reuse styles for consistency

const Reviews = () => {
    return (
        <div className="my-orders-container">
            <h1>My Reviews</h1>
            <div className="empty-state">
                <p>You haven't posted any reviews yet.</p>
            </div>
        </div>
    );
};

export default Reviews;
