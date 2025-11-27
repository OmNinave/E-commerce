import React from 'react';
import '../../styles/Legal.css';

const Terms = () => {
    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1>Terms of Service</h1>
                <p className="last-updated">Last Updated: November 23, 2025</p>

                <section>
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to ProLab Equipment. By accessing our website and purchasing our products,
                        you agree to be bound by these Terms of Service.
                    </p>
                </section>

                <section>
                    <h2>2. Use of Service</h2>
                    <p>
                        You must be at least 18 years old to use this service. You agree not to use
                        our products for any illegal or unauthorized purpose.
                    </p>
                </section>

                <section>
                    <h2>3. Products and Pricing</h2>
                    <p>
                        We reserve the right to modify or discontinue any product at any time.
                        Prices are subject to change without notice. We are not liable for any
                        modifications, price changes, or discontinuance.
                    </p>
                </section>

                <section>
                    <h2>4. Returns and Refunds</h2>
                    <p>
                        Please review our Return Policy. We accept returns within 30 days of purchase
                        for defective items. Shipping costs for returns are the responsibility of the customer
                        unless the item is defective.
                    </p>
                </section>

                <section>
                    <h2>5. Limitation of Liability</h2>
                    <p>
                        ProLab Equipment shall not be liable for any direct, indirect, incidental,
                        special, or consequential damages resulting from the use or inability to use
                        our products.
                    </p>
                </section>

                <section>
                    <h2>6. Contact Information</h2>
                    <p>
                        Questions about the Terms of Service should be sent to us at support@prolab.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
